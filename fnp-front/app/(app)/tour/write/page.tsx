'use client';

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

type ToolbarBtnProps = {
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
    title: string;
    children: React.ReactNode;
    active?: boolean;
};

const ToolbarBtn = ({ onClick, title, children, active }: ToolbarBtnProps) => (
    <button
        type="button"
        title={title}
        onMouseDown={(e) => e.preventDefault()}
        onClick={onClick}
        className={`min-w-[30px] h-8 px-2 flex items-center justify-center text-sm rounded transition ${
            active
                ? 'bg-sky-100 text-sky-700 shadow-inner ring-1 ring-sky-300'
                : 'text-gray-700 hover:bg-gray-100'
        }`}
    >
        {children}
    </button>
);

const Divider = () => <span className="w-px h-5 bg-gray-200 mx-1" />;

const FONT_FAMILIES = [
    { label: '기본서체', value: '' },
    { label: '나눔고딕', value: "'Nanum Gothic', sans-serif" },
    { label: '나눔명조', value: "'Nanum Myeongjo', serif" },
    { label: '맑은 고딕', value: "'Malgun Gothic', sans-serif" },
    { label: '돋움', value: 'Dotum, sans-serif' },
    { label: '굴림', value: 'Gulim, sans-serif' },
    { label: '바탕', value: 'Batang, serif' },
    { label: 'Arial', value: 'Arial, sans-serif' },
    { label: 'Georgia', value: 'Georgia, serif' },
    { label: 'Courier New', value: "'Courier New', monospace" },
];

const FONT_SIZES = [
    { label: '8pt', value: '1' },
    { label: '10pt', value: '2' },
    { label: '12pt', value: '3' },
    { label: '14pt', value: '4' },
    { label: '18pt', value: '5' },
    { label: '24pt', value: '6' },
    { label: '36pt', value: '7' },
];

const COLORS = [
    '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff',
    '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff',
    '#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc',
    '#cc4125', '#e06666', '#f6b26b', '#ffd966', '#93c47d', '#76a5af', '#6d9eeb', '#6fa8dc', '#8e7cc3', '#c27ba0',
];

export default function TourWritePage() {
    const router = useRouter();
    const editorRef = useRef<HTMLDivElement>(null);
    const [title, setTitle] = useState('');
    const [openMenu, setOpenMenu] = useState<'font' | 'size' | 'color' | 'bgcolor' | 'table' | 'link' | 'image' | null>(null);
    const [popoverAlign, setPopoverAlign] = useState<'left' | 'right'>('right');
    const [tableHover, setTableHover] = useState<{ r: number; c: number }>({ r: 0, c: 0 });
    const [sourceView, setSourceView] = useState(false);
    const [sourceHtml, setSourceHtml] = useState('');

    // 커서가 collapsed 일 때 (타이핑 모드) 현재 위치의 서식 활성 여부
    const [activeFormats, setActiveFormats] = useState({
        bold: false,
        italic: false,
        underline: false,
        strikeThrough: false,
    });
    // 블록 선택에 서식 적용 시 잠깐 깜빡일 때만 true
    const [flashFormats, setFlashFormats] = useState({
        bold: false,
        italic: false,
        underline: false,
        strikeThrough: false,
    });

    // 트리거 버튼 위치 기준 좌/우 가용 공간 비교 후 더 넓은 쪽으로 popover 펼침
    const openPopover = (
        menu: 'link' | 'image' | 'table',
        triggerEl: HTMLElement
    ) => {
        const rect = triggerEl.getBoundingClientRect();
        const spaceRight = window.innerWidth - rect.left;
        const spaceLeft = rect.right;
        setPopoverAlign(spaceRight >= spaceLeft ? 'left' : 'right');
        setOpenMenu(menu);
    };

    // 외부 클릭으로 메뉴 닫기
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('[data-toolbar-menu]')) setOpenMenu(null);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // 화면 크기 변경(resize) 시 열려있는 popover 자동 닫기
    useEffect(() => {
        if (!openMenu) return;
        const close = () => setOpenMenu(null);
        window.addEventListener('resize', close);
        return () => window.removeEventListener('resize', close);
    }, [openMenu]);

    // 커서 위치 기준 B/I/U/S 활성 상태 추적 (collapsed 셀렉션일 때만)
    useEffect(() => {
        const onSelChange = () => {
            const sel = window.getSelection();
            const editor = editorRef.current;
            if (!sel || sel.rangeCount === 0 || !editor || !editor.contains(sel.anchorNode)) {
                return;
            }
            if (!sel.isCollapsed) {
                // 블록 선택 중에는 누름 상태 표시 안 함 → 적용 후 자연 복귀
                setActiveFormats({ bold: false, italic: false, underline: false, strikeThrough: false });
                return;
            }
            setActiveFormats({
                bold: document.queryCommandState('bold'),
                italic: document.queryCommandState('italic'),
                underline: document.queryCommandState('underline'),
                strikeThrough: document.queryCommandState('strikeThrough'),
            });
        };
        document.addEventListener('selectionchange', onSelChange);
        return () => document.removeEventListener('selectionchange', onSelChange);
    }, []);

    // 표 셀 가장자리 드래그로 행/열 크기 조정 (마우스 + 터치 지원)
    useEffect(() => {
        const editor = editorRef.current;
        if (!editor) return;

        type Mode = 'col' | 'row';
        let mode: Mode | null = null;
        let activeCell: HTMLTableCellElement | null = null;
        let activeRow: HTMLTableRowElement | null = null;
        let startX = 0;
        let startY = 0;
        let startWidth = 0;
        let startHeight = 0;

        const detectEdge = (
            target: EventTarget | null,
            clientX: number,
            clientY: number,
            isTouch: boolean
        ): { mode: Mode; cell: HTMLTableCellElement } | null => {
            if (!(target instanceof HTMLElement)) return null;
            const cell = target.closest('td, th') as HTMLTableCellElement | null;
            if (!cell || !editor.contains(cell)) return null;
            const rect = cell.getBoundingClientRect();
            const threshold = isTouch ? 14 : 6;
            const fromRight = rect.right - clientX;
            const fromBottom = rect.bottom - clientY;
            if (fromRight >= -2 && fromRight <= threshold) return { mode: 'col', cell };
            if (fromBottom >= -2 && fromBottom <= threshold) return { mode: 'row', cell };
            return null;
        };

        const onPointerDown = (e: PointerEvent) => {
            const edge = detectEdge(e.target, e.clientX, e.clientY, e.pointerType === 'touch');
            if (!edge) return;
            e.preventDefault();
            mode = edge.mode;
            startX = e.clientX;
            startY = e.clientY;
            if (edge.mode === 'col') {
                activeCell = edge.cell;
                startWidth = edge.cell.getBoundingClientRect().width;
            } else {
                activeRow = edge.cell.parentElement as HTMLTableRowElement;
                startHeight = activeRow.getBoundingClientRect().height;
            }
            try {
                editor.setPointerCapture(e.pointerId);
            } catch {}
            editor.style.userSelect = 'none';
        };

        const onPointerMove = (e: PointerEvent) => {
            if (mode === 'col' && activeCell) {
                e.preventDefault();
                const newW = Math.max(30, startWidth + (e.clientX - startX));
                activeCell.style.width = `${newW}px`;
            } else if (mode === 'row' && activeRow) {
                e.preventDefault();
                const newH = Math.max(20, startHeight + (e.clientY - startY));
                activeRow.style.height = `${newH}px`;
            } else if (e.pointerType === 'mouse') {
                const edge = detectEdge(e.target, e.clientX, e.clientY, false);
                editor.style.cursor = edge
                    ? edge.mode === 'col'
                        ? 'col-resize'
                        : 'row-resize'
                    : '';
            }
        };

        const onPointerUp = (e: PointerEvent) => {
            if (!mode) return;
            try {
                editor.releasePointerCapture(e.pointerId);
            } catch {}
            mode = null;
            activeCell = null;
            activeRow = null;
            editor.style.cursor = '';
            editor.style.userSelect = '';
        };

        editor.addEventListener('pointerdown', onPointerDown);
        editor.addEventListener('pointermove', onPointerMove);
        editor.addEventListener('pointerup', onPointerUp);
        editor.addEventListener('pointercancel', onPointerUp);
        return () => {
            editor.removeEventListener('pointerdown', onPointerDown);
            editor.removeEventListener('pointermove', onPointerMove);
            editor.removeEventListener('pointerup', onPointerUp);
            editor.removeEventListener('pointercancel', onPointerUp);
        };
    }, [sourceView]);

    // 셀렉션 보존
    const savedRangeRef = useRef<Range | null>(null);
    const saveSelection = () => {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
            const range = sel.getRangeAt(0);
            if (editorRef.current?.contains(range.commonAncestorContainer)) {
                savedRangeRef.current = range.cloneRange();
            }
        }
    };
    const restoreSelection = () => {
        const sel = window.getSelection();
        if (savedRangeRef.current && sel) {
            sel.removeAllRanges();
            sel.addRange(savedRangeRef.current);
        }
    };

    const focusEditor = () => {
        editorRef.current?.focus();
        restoreSelection();
    };

    const exec = (command: string, value?: string) => {
        focusEditor();
        document.execCommand(command, false, value);
    };

    const insertHTML = (html: string) => {
        focusEditor();
        document.execCommand('insertHTML', false, html);
    };

    // B/I/U/S — collapsed 셀렉션이면 토글로 누름 상태 유지, 블록 선택이면 깜빡 후 정상 복귀
    const applyFormat = (fmt: 'bold' | 'italic' | 'underline' | 'strikeThrough') => {
        const sel = window.getSelection();
        const editor = editorRef.current;
        const isBlock = Boolean(
            sel && editor && sel.rangeCount > 0 && !sel.isCollapsed && editor.contains(sel.anchorNode)
        );
        if (isBlock) {
            setFlashFormats((f) => ({ ...f, [fmt]: true }));
            window.setTimeout(() => {
                setFlashFormats((f) => ({ ...f, [fmt]: false }));
            }, 200);
        }
        exec(fmt);
    };

    // 줄간격: 현재 셀렉션이 걸친 모든 블록 요소에 line-height 적용
    const setLineHeight = (lh: string) => {
        focusEditor();
        const sel = window.getSelection();
        const root = editorRef.current;
        if (!sel || sel.rangeCount === 0 || !root) return;
        const range = sel.getRangeAt(0);
        const blockSel = 'p, div, h1, h2, h3, h4, h5, h6, li, blockquote, td, th';

        const findBlock = (node: Node | null): HTMLElement | null => {
            let el: Node | null = node;
            while (el && el !== root) {
                if (el instanceof HTMLElement && el.matches(blockSel)) return el;
                el = el.parentNode;
            }
            return null;
        };

        const blocks = new Set<HTMLElement>();
        const startBlock = findBlock(range.startContainer);
        const endBlock = findBlock(range.endContainer);
        if (startBlock) blocks.add(startBlock);
        if (endBlock) blocks.add(endBlock);
        if (!range.collapsed) {
            root.querySelectorAll<HTMLElement>(blockSel).forEach((b) => {
                if (range.intersectsNode(b)) blocks.add(b);
            });
        }

        if (blocks.size === 0) {
            root.style.lineHeight = lh;
            return;
        }
        blocks.forEach((b) => {
            b.style.lineHeight = lh;
        });
    };

    const handleInsertTable = (rows: number, cols: number) => {
        let tableHtml = `<table class="fnp-tbl" style="border-collapse:collapse;width:100%;margin:8px 0;"><tbody>`;
        for (let r = 0; r < rows; r++) {
            tableHtml += '<tr>';
            for (let c = 0; c < cols; c++) {
                tableHtml += `<td style="border:1px solid #d1d5db;padding:8px;min-width:40px;height:32px;vertical-align:top;">&nbsp;</td>`;
            }
            tableHtml += '</tr>';
        }
        tableHtml += '</tbody></table><p><br/></p>';
        insertHTML(tableHtml);
        setOpenMenu(null);
    };

    const handleInsertLink = (url: string, text: string) => {
        if (!url) return;
        const safeUrl = /^https?:\/\//i.test(url) ? url : `https://${url}`;
        const linkText = text || safeUrl;
        insertHTML(
            `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer" style="color:#2563eb;text-decoration:underline;">${linkText}</a>`
        );
        setOpenMenu(null);
    };

    const handleInsertImage = (url: string, alt: string) => {
        if (!url) return;
        insertHTML(
            `<img src="${url}" alt="${alt || ''}" style="max-width:100%;height:auto;margin:8px 0;border-radius:4px;" />`
        );
        setOpenMenu(null);
    };

    const handleImageUpload = (file: File) => {
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                handleInsertImage(reader.result, file.name);
            }
        };
        reader.readAsDataURL(file);
    };

    const toggleSourceView = () => {
        if (!sourceView) {
            // 편집기 → HTML: 현재 innerHTML 저장
            setSourceHtml(editorRef.current?.innerHTML ?? '');
        }
        // HTML → 편집기로 복귀 시 innerHTML 복원은 아래 useLayoutEffect 에서 처리
        // (이 시점에는 editor div 가 아직 마운트되지 않아 직접 할당 불가)
        setSourceView((v) => !v);
    };

    // sourceView 토글 후 editor div 가 다시 마운트되면 저장된 HTML 을 복원
    useLayoutEffect(() => {
        if (!sourceView && editorRef.current) {
            editorRef.current.innerHTML = sourceHtml;
        }
        // 의도적으로 sourceHtml 만 의존성에서 제외 — textarea 입력마다 재실행 불필요
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sourceView]);

    const handleSubmit = () => {
        if (!title.trim()) {
            alert('제목을 입력해 주세요.');
            return;
        }
        const content = sourceView ? sourceHtml : (editorRef.current?.innerHTML ?? '');
        // TODO: API 연결
        console.log('SUBMIT', { title, content });
        alert('등록되었습니다. (개발 중: API 연결 필요)');
        router.push('/tour');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <main className="max-w-5xl mx-auto mt-16 px-4 py-10">
                {/* 페이지 헤더 */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">투어 글쓰기</h1>
                    <p className="text-sm text-gray-500 mt-1">새로운 투어 게시글을 작성합니다.</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                    {/* 제목 */}
                    <div className="border-b border-gray-200 px-4 py-3">
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="제목을 입력하세요"
                            className="w-full text-lg font-semibold outline-none placeholder-gray-300"
                        />
                    </div>

                    {/* 툴바 */}
                    <div className="border-b border-gray-200 bg-gray-50 px-2 py-1.5 flex flex-wrap items-center gap-0.5">
                        {/* 글꼴 */}
                        <div className="relative" data-toolbar-menu>
                            <button
                                type="button"
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    saveSelection();
                                }}
                                onClick={() => setOpenMenu(openMenu === 'font' ? null : 'font')}
                                className="h-8 px-2 text-sm text-gray-700 rounded hover:bg-gray-100 flex items-center gap-1 min-w-[100px] justify-between"
                            >
                                <span>글꼴</span>
                                <span className="text-xs">▾</span>
                            </button>
                            {openMenu === 'font' && (
                                <div className="absolute top-full left-0 mt-1 w-44 bg-white border border-gray-200 rounded shadow-lg z-20 py-1">
                                    {FONT_FAMILIES.map((f) => (
                                        <button
                                            key={f.label}
                                            type="button"
                                            onMouseDown={(e) => e.preventDefault()}
                                            onClick={() => {
                                                exec('fontName', f.value || 'sans-serif');
                                                setOpenMenu(null);
                                            }}
                                            style={{ fontFamily: f.value || undefined }}
                                            className="w-full text-left px-3 py-1.5 text-sm hover:bg-sky-50"
                                        >
                                            {f.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* 크기 */}
                        <div className="relative" data-toolbar-menu>
                            <button
                                type="button"
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    saveSelection();
                                }}
                                onClick={() => setOpenMenu(openMenu === 'size' ? null : 'size')}
                                className="h-8 px-2 text-sm text-gray-700 rounded hover:bg-gray-100 flex items-center gap-1 min-w-[70px] justify-between"
                            >
                                <span>크기</span>
                                <span className="text-xs">▾</span>
                            </button>
                            {openMenu === 'size' && (
                                <div className="absolute top-full left-0 mt-1 w-28 bg-white border border-gray-200 rounded shadow-lg z-20 py-1">
                                    {FONT_SIZES.map((s) => (
                                        <button
                                            key={s.value}
                                            type="button"
                                            onMouseDown={(e) => e.preventDefault()}
                                            onClick={() => {
                                                exec('fontSize', s.value);
                                                setOpenMenu(null);
                                            }}
                                            className="w-full text-left px-3 py-1.5 text-sm hover:bg-sky-50"
                                        >
                                            {s.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Divider />

                        {/* 기본 서식 */}
                        <ToolbarBtn
                            title="굵게 (Ctrl+B)"
                            onClick={() => applyFormat('bold')}
                            active={activeFormats.bold || flashFormats.bold}
                        >
                            <span className="font-bold">B</span>
                        </ToolbarBtn>
                        <ToolbarBtn
                            title="기울임 (Ctrl+I)"
                            onClick={() => applyFormat('italic')}
                            active={activeFormats.italic || flashFormats.italic}
                        >
                            <span className="italic">I</span>
                        </ToolbarBtn>
                        <ToolbarBtn
                            title="밑줄 (Ctrl+U)"
                            onClick={() => applyFormat('underline')}
                            active={activeFormats.underline || flashFormats.underline}
                        >
                            <span className="underline">U</span>
                        </ToolbarBtn>
                        <ToolbarBtn
                            title="취소선"
                            onClick={() => applyFormat('strikeThrough')}
                            active={activeFormats.strikeThrough || flashFormats.strikeThrough}
                        >
                            <span className="line-through">S</span>
                        </ToolbarBtn>

                        <Divider />

                        {/* 글자색 */}
                        <div className="relative" data-toolbar-menu>
                            <button
                                type="button"
                                title="글자색"
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    saveSelection();
                                }}
                                onClick={() => setOpenMenu(openMenu === 'color' ? null : 'color')}
                                className="h-8 px-2 text-sm text-gray-700 rounded hover:bg-gray-100 flex items-center gap-1"
                            >
                                <span className="font-bold underline decoration-red-500 decoration-2 underline-offset-2">가</span>
                                <span className="text-xs">▾</span>
                            </button>
                            {openMenu === 'color' && (
                                <ColorPalette
                                    onPick={(c) => {
                                        exec('foreColor', c);
                                        setOpenMenu(null);
                                    }}
                                />
                            )}
                        </div>

                        {/* 배경색 */}
                        <div className="relative" data-toolbar-menu>
                            <button
                                type="button"
                                title="배경색"
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    saveSelection();
                                }}
                                onClick={() => setOpenMenu(openMenu === 'bgcolor' ? null : 'bgcolor')}
                                className="h-8 px-2 text-sm text-gray-700 rounded hover:bg-gray-100 flex items-center gap-1"
                            >
                                <span className="font-bold bg-yellow-200 px-1 rounded">가</span>
                                <span className="text-xs">▾</span>
                            </button>
                            {openMenu === 'bgcolor' && (
                                <ColorPalette
                                    onPick={(c) => {
                                        exec('hiliteColor', c);
                                        setOpenMenu(null);
                                    }}
                                />
                            )}
                        </div>

                        <Divider />

                        {/* 정렬 */}
                        <ToolbarBtn title="왼쪽 정렬" onClick={() => exec('justifyLeft')}>
                            <AlignIcon dir="left" />
                        </ToolbarBtn>
                        <ToolbarBtn title="가운데 정렬" onClick={() => exec('justifyCenter')}>
                            <AlignIcon dir="center" />
                        </ToolbarBtn>
                        <ToolbarBtn title="오른쪽 정렬" onClick={() => exec('justifyRight')}>
                            <AlignIcon dir="right" />
                        </ToolbarBtn>
                        <ToolbarBtn title="양쪽 정렬" onClick={() => exec('justifyFull')}>
                            <AlignIcon dir="justify" />
                        </ToolbarBtn>

                        {/* 줄간격 */}
                        <select
                            title="줄간격"
                            defaultValue=""
                            onMouseDown={() => saveSelection()}
                            onChange={(e) => {
                                const v = e.target.value;
                                if (!v) return;
                                setLineHeight(v);
                                e.target.value = '';
                            }}
                            className="h-8 px-1 ml-1 text-sm text-gray-700 bg-white border border-gray-200 rounded hover:bg-gray-50 outline-none cursor-pointer"
                        >
                            <option value="" disabled hidden>
                                줄간격
                            </option>
                            <option value="1">1.0</option>
                            <option value="1.2">1.2</option>
                            <option value="1.5">1.5</option>
                            <option value="1.8">1.8</option>
                            <option value="2">2.0</option>
                            <option value="2.5">2.5</option>
                            <option value="3">3.0</option>
                        </select>

                        <Divider />

                        {/* 목록 */}
                        <ToolbarBtn title="번호 목록" onClick={() => exec('insertOrderedList')}>
                            <span className="text-xs">1.≡</span>
                        </ToolbarBtn>
                        <ToolbarBtn title="글머리 기호" onClick={() => exec('insertUnorderedList')}>
                            <span className="text-xs">•≡</span>
                        </ToolbarBtn>
                        <ToolbarBtn title="내어쓰기" onClick={() => exec('outdent')}>
                            <span className="text-xs">⇤</span>
                        </ToolbarBtn>
                        <ToolbarBtn title="들여쓰기" onClick={() => exec('indent')}>
                            <span className="text-xs">⇥</span>
                        </ToolbarBtn>

                        <Divider />

                        {/* 인용 / 구분선 */}
                        <ToolbarBtn
                            title="인용구"
                            onClick={() => insertHTML('<blockquote style="border-left:4px solid #cbd5e1;padding:6px 12px;color:#475569;margin:8px 0;background:#f8fafc;">인용 내용을 입력하세요</blockquote><p><br/></p>')}
                        >
                            <span className="text-xs">❝</span>
                        </ToolbarBtn>
                        <ToolbarBtn title="구분선" onClick={() => insertHTML('<hr style="border:none;border-top:1px solid #e5e7eb;margin:12px 0;" />')}>
                            <span className="text-xs">―</span>
                        </ToolbarBtn>

                        <Divider />

                        {/* 링크 */}
                        <div className="relative" data-toolbar-menu>
                            <ToolbarBtn
                                title="링크"
                                onClick={(e) => {
                                    saveSelection();
                                    if (openMenu === 'link') setOpenMenu(null);
                                    else openPopover('link', e.currentTarget);
                                }}
                            >
                                <span className="text-xs">🔗</span>
                            </ToolbarBtn>
                            {openMenu === 'link' && (
                                <LinkPopover
                                    align={popoverAlign}
                                    onApply={handleInsertLink}
                                    onClose={() => setOpenMenu(null)}
                                />
                            )}
                        </div>

                        {/* 이미지 */}
                        <div className="relative" data-toolbar-menu>
                            <ToolbarBtn
                                title="이미지"
                                onClick={(e) => {
                                    saveSelection();
                                    if (openMenu === 'image') setOpenMenu(null);
                                    else openPopover('image', e.currentTarget);
                                }}
                            >
                                <span className="text-xs">🖼</span>
                            </ToolbarBtn>
                            {openMenu === 'image' && (
                                <ImagePopover
                                    align={popoverAlign}
                                    onUrl={handleInsertImage}
                                    onFile={handleImageUpload}
                                    onClose={() => setOpenMenu(null)}
                                />
                            )}
                        </div>

                        {/* 표 */}
                        <div className="relative" data-toolbar-menu>
                            <ToolbarBtn
                                title="표 삽입"
                                onClick={(e) => {
                                    saveSelection();
                                    setTableHover({ r: 0, c: 0 });
                                    if (openMenu === 'table') setOpenMenu(null);
                                    else openPopover('table', e.currentTarget);
                                }}
                            >
                                <span className="text-xs">▦</span>
                            </ToolbarBtn>
                            {openMenu === 'table' && (
                                <div className={`absolute top-full ${popoverAlign === 'left' ? 'left-0' : 'right-0'} mt-1 bg-white border border-gray-200 rounded shadow-lg z-20 p-3 w-57.5`}>
                                    <div className="text-xs text-gray-600 mb-2 text-center">
                                        {tableHover.r > 0 ? `${tableHover.r} × ${tableHover.c} 표` : '드래그하여 크기 선택'}
                                    </div>
                                    <div
                                        className="grid gap-0.5"
                                        style={{ gridTemplateColumns: 'repeat(10, 18px)' }}
                                        onMouseLeave={() => setTableHover({ r: 0, c: 0 })}
                                    >
                                        {Array.from({ length: 8 * 10 }).map((_, i) => {
                                            const r = Math.floor(i / 10) + 1;
                                            const c = (i % 10) + 1;
                                            const active = r <= tableHover.r && c <= tableHover.c;
                                            return (
                                                <button
                                                    key={i}
                                                    type="button"
                                                    onMouseDown={(e) => e.preventDefault()}
                                                    onMouseEnter={() => setTableHover({ r, c })}
                                                    onClick={() => handleInsertTable(r, c)}
                                                    className={`w-[18px] h-[18px] border ${
                                                        active ? 'bg-sky-400 border-sky-500' : 'bg-white border-gray-300'
                                                    }`}
                                                />
                                            );
                                        })}
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-gray-100 flex gap-1">
                                        <button
                                            type="button"
                                            onMouseDown={(e) => e.preventDefault()}
                                            onClick={() => {
                                                const input = prompt('행 × 열 (예: 3x4)', '3x3');
                                                if (!input) return;
                                                const m = input.match(/(\d+)\s*[xX×]\s*(\d+)/);
                                                if (m) handleInsertTable(Math.min(50, +m[1]), Math.min(20, +m[2]));
                                            }}
                                            className="flex-1 text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
                                        >
                                            직접 입력
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <Divider />

                        {/* 되돌리기 / 다시실행 */}
                        <ToolbarBtn title="되돌리기 (Ctrl+Z)" onClick={() => exec('undo')}>
                            <span className="text-xs">↶</span>
                        </ToolbarBtn>
                        <ToolbarBtn title="다시실행 (Ctrl+Y)" onClick={() => exec('redo')}>
                            <span className="text-xs">↷</span>
                        </ToolbarBtn>

                        <Divider />

                        {/* 서식 제거 */}
                        <ToolbarBtn
                            title="서식 제거"
                            onClick={() => {
                                exec('removeFormat');
                                exec('unlink');
                            }}
                        >
                            <span className="text-xs">✕T</span>
                        </ToolbarBtn>

                        {/* 소스 보기 */}
                        <div className="ml-auto">
                            <button
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={toggleSourceView}
                                className={`h-8 px-3 text-xs rounded transition ${
                                    sourceView ? 'bg-gray-800 text-white' : 'text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                {sourceView ? '편집기' : '<> HTML'}
                            </button>
                        </div>
                    </div>

                    {/* 표 편집 보조 툴바 */}
                    <TableSubToolbar editorRef={editorRef} />

                    {/* 본문 */}
                    {sourceView ? (
                        <textarea
                            value={sourceHtml}
                            onChange={(e) => setSourceHtml(e.target.value)}
                            className="w-full min-h-[480px] p-4 font-mono text-xs outline-none resize-y"
                            placeholder="<p>HTML 소스를 입력하세요</p>"
                        />
                    ) : (
                        <div
                            ref={editorRef}
                            contentEditable
                            suppressContentEditableWarning
                            onMouseUp={saveSelection}
                            onKeyUp={saveSelection}
                            className="fnp-editor min-h-[480px] p-5 outline-none text-[15px] leading-relaxed text-gray-800"
                            data-placeholder="내용을 입력하세요. 표 삽입은 툴바의 ▦ 아이콘을 눌러주세요."
                        />
                    )}
                </div>

                {/* 하단 버튼 */}
                <div className="mt-6 flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={() => router.push('/tour')}
                        className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded shadow-sm hover:bg-gray-50 transition text-sm font-medium"
                    >
                        취소
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        className="px-6 py-2.5 bg-gray-800 text-white rounded shadow-sm hover:bg-gray-700 transition text-sm font-medium"
                    >
                        등록
                    </button>
                </div>
            </main>

            <style>{`
                .fnp-editor:empty:before {
                    content: attr(data-placeholder);
                    color: #cbd5e1;
                    pointer-events: none;
                }
                .fnp-editor table { border-collapse: collapse; }
                .fnp-editor table td, .fnp-editor table th {
                    border: 1px solid #d1d5db;
                    padding: 8px;
                    min-width: 40px;
                    vertical-align: top;
                }
                .fnp-editor table td:focus, .fnp-editor table th:focus {
                    outline: 2px solid #38bdf8;
                    outline-offset: -2px;
                }
                .fnp-editor ul { list-style: disc; padding-left: 24px; }
                .fnp-editor ol { list-style: decimal; padding-left: 24px; }
                .fnp-editor a { color: #2563eb; text-decoration: underline; }
                .fnp-editor blockquote {
                    border-left: 4px solid #cbd5e1;
                    padding: 6px 12px;
                    color: #475569;
                    margin: 8px 0;
                    background: #f8fafc;
                }
                .fnp-editor img { max-width: 100%; height: auto; }
                .fnp-editor h1 { font-size: 1.8em; font-weight: 700; margin: 0.5em 0; }
                .fnp-editor h2 { font-size: 1.5em; font-weight: 700; margin: 0.5em 0; }
                .fnp-editor h3 { font-size: 1.25em; font-weight: 700; margin: 0.5em 0; }
            `}</style>
        </div>
    );
}

/* ---------- 보조 컴포넌트 ---------- */

const AlignIcon = ({ dir }: { dir: 'left' | 'center' | 'right' | 'justify' }) => {
    const lines: Record<string, string[]> = {
        left: ['w-full', 'w-2/3', 'w-full', 'w-1/2'],
        center: ['w-full mx-auto', 'w-2/3 mx-auto', 'w-full mx-auto', 'w-1/2 mx-auto'],
        right: ['w-full ml-auto', 'w-2/3 ml-auto', 'w-full ml-auto', 'w-1/2 ml-auto'],
        justify: ['w-full', 'w-full', 'w-full', 'w-full'],
    };
    return (
        <div className="flex flex-col gap-[2px] w-4">
            {lines[dir].map((cls, i) => (
                <span key={i} className={`h-[2px] bg-gray-600 ${cls}`} />
            ))}
        </div>
    );
};

const ColorPalette = ({ onPick }: { onPick: (c: string) => void }) => (
    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-20 p-3">
        <div className="grid grid-cols-10 gap-1.5">
            {COLORS.map((c) => (
                <button
                    key={c}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => onPick(c)}
                    style={{ backgroundColor: c }}
                    className="w-7 h-7 border border-gray-200 rounded-sm hover:ring-2 hover:ring-sky-400 hover:z-10 transition"
                    title={c}
                />
            ))}
        </div>
        <div className="mt-3 pt-2 border-t border-gray-100">
            <input
                type="color"
                onMouseDown={(e) => e.stopPropagation()}
                onChange={(e) => onPick(e.target.value)}
                className="w-full h-8 cursor-pointer"
            />
        </div>
    </div>
);

const LinkPopover = ({
    align,
    onApply,
    onClose,
}: {
    align: 'left' | 'right';
    onApply: (url: string, text: string) => void;
    onClose: () => void;
}) => {
    const [url, setUrl] = useState('');
    const [text, setText] = useState('');
    return (
        <div className={`absolute top-full ${align === 'left' ? 'left-0' : 'right-0'} mt-1 w-72 bg-white border border-gray-200 rounded shadow-lg z-20 p-3`}>
            <div className="text-xs font-semibold text-gray-700 mb-2">링크 삽입</div>
            <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm mb-2 outline-none focus:border-sky-500"
                autoFocus
            />
            <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="표시할 텍스트 (선택)"
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm mb-2 outline-none focus:border-sky-500"
            />
            <div className="flex justify-end gap-1">
                <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={onClose}
                    className="px-3 py-1 text-xs text-gray-600 hover:bg-gray-50 rounded"
                >
                    취소
                </button>
                <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => onApply(url, text)}
                    className="px-3 py-1 text-xs bg-sky-600 text-white rounded hover:bg-sky-700"
                >
                    적용
                </button>
            </div>
        </div>
    );
};

const ImagePopover = ({
    align,
    onUrl,
    onFile,
    onClose,
}: {
    align: 'left' | 'right';
    onUrl: (url: string, alt: string) => void;
    onFile: (f: File) => void;
    onClose: () => void;
}) => {
    const [url, setUrl] = useState('');
    const [alt, setAlt] = useState('');
    const fileRef = useRef<HTMLInputElement>(null);
    return (
        <div className={`absolute top-full ${align === 'left' ? 'left-0' : 'right-0'} mt-1 w-72 bg-white border border-gray-200 rounded shadow-lg z-20 p-3`}>
            <div className="text-xs font-semibold text-gray-700 mb-2">이미지 삽입</div>
            <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => fileRef.current?.click()}
                className="w-full mb-2 px-3 py-2 text-xs border border-dashed border-gray-300 rounded hover:bg-gray-50 text-gray-600"
            >
                내 PC에서 업로드
            </button>
            <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                        onFile(f);
                        onClose();
                    }
                }}
            />
            <div className="text-[11px] text-gray-400 mb-2 text-center">또는 URL로 삽입</div>
            <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://.../image.jpg"
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm mb-2 outline-none focus:border-sky-500"
            />
            <input
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
                placeholder="대체 텍스트 (선택)"
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm mb-2 outline-none focus:border-sky-500"
            />
            <div className="flex justify-end gap-1">
                <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={onClose}
                    className="px-3 py-1 text-xs text-gray-600 hover:bg-gray-50 rounded"
                >
                    취소
                </button>
                <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => onUrl(url, alt)}
                    className="px-3 py-1 text-xs bg-sky-600 text-white rounded hover:bg-sky-700"
                >
                    적용
                </button>
            </div>
        </div>
    );
};

/* 표 편집 시 사용하는 보조 툴바 (현재 셀이 표 안인지 감지) */
const TableSubToolbar = ({ editorRef }: { editorRef: React.RefObject<HTMLDivElement | null> }) => {
    const [inTable, setInTable] = useState(false);

    useEffect(() => {
        const checkInTable = () => {
            const sel = window.getSelection();
            if (!sel || sel.rangeCount === 0) {
                setInTable(false);
                return;
            }
            const node = sel.anchorNode;
            if (!node || !editorRef.current?.contains(node)) {
                setInTable(false);
                return;
            }
            let el: Node | null = node;
            while (el && el !== editorRef.current) {
                if ((el as HTMLElement).tagName === 'TD' || (el as HTMLElement).tagName === 'TH') {
                    setInTable(true);
                    return;
                }
                el = el.parentNode;
            }
            setInTable(false);
        };
        document.addEventListener('selectionchange', checkInTable);
        return () => document.removeEventListener('selectionchange', checkInTable);
    }, [editorRef]);

    const getCurrentCell = (): HTMLTableCellElement | null => {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return null;
        let node: Node | null = sel.anchorNode;
        while (node && node !== editorRef.current) {
            const el = node as HTMLElement;
            if (el.tagName === 'TD' || el.tagName === 'TH') return el as HTMLTableCellElement;
            node = node.parentNode;
        }
        return null;
    };

    const addRow = (after: boolean) => {
        const cell = getCurrentCell();
        if (!cell) return;
        const row = cell.parentElement as HTMLTableRowElement;
        const newRow = row.cloneNode(true) as HTMLTableRowElement;
        Array.from(newRow.cells).forEach((c) => (c.innerHTML = '&nbsp;'));
        if (after) row.after(newRow);
        else row.before(newRow);
    };

    const addCol = (after: boolean) => {
        const cell = getCurrentCell();
        if (!cell) return;
        const idx = cell.cellIndex;
        const table = cell.closest('table');
        if (!table) return;
        Array.from(table.rows).forEach((r) => {
            const ref = r.cells[idx];
            const newCell = document.createElement(ref.tagName.toLowerCase()) as HTMLTableCellElement;
            newCell.innerHTML = '&nbsp;';
            newCell.style.cssText = ref.style.cssText || 'border:1px solid #d1d5db;padding:8px;min-width:40px;height:32px;vertical-align:top;';
            if (after) ref.after(newCell);
            else ref.before(newCell);
        });
    };

    const delRow = () => {
        const cell = getCurrentCell();
        if (!cell) return;
        const row = cell.parentElement as HTMLTableRowElement;
        const table = cell.closest('table');
        if (table && table.rows.length > 1) row.remove();
    };

    const delCol = () => {
        const cell = getCurrentCell();
        if (!cell) return;
        const idx = cell.cellIndex;
        const table = cell.closest('table');
        if (!table) return;
        if (table.rows[0].cells.length <= 1) return;
        Array.from(table.rows).forEach((r) => r.cells[idx]?.remove());
    };

    const delTable = () => {
        const cell = getCurrentCell();
        cell?.closest('table')?.remove();
    };

    if (!inTable) return null;

    return (
        <div className="border-b border-gray-200 bg-sky-50/60 px-3 py-1.5 flex flex-wrap items-center gap-1 text-xs">
            <span className="text-sky-700 font-medium mr-2">표 편집:</span>
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => addRow(false)} className="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50">위에 행 추가</button>
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => addRow(true)} className="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50">아래에 행 추가</button>
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => addCol(false)} className="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50">왼쪽에 열 추가</button>
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => addCol(true)} className="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50">오른쪽에 열 추가</button>
            <span className="w-px h-4 bg-gray-300 mx-1" />
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={delRow} className="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-red-50 text-red-600">행 삭제</button>
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={delCol} className="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-red-50 text-red-600">열 삭제</button>
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={delTable} className="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-red-50 text-red-600">표 삭제</button>
        </div>
    );
};
