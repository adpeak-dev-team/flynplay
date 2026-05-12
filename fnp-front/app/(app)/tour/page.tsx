import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

// --- 컴포넌트 분리: 투어 테이블 (KBoard 스타일) ---
const TourTable = () => {
    const tours = [
        { id: 4, title: '2026/2027 플라이앤플레이 투어', author: '플라이앤플레이', date: '2026.05.04', views: 60, isNotice: true },
        { id: 3, title: '[연말] 2026년 12월 26일(토) - 2027년 1월 2일(토) 몰디브 센트럴 7박 8일 $500 할인 / 테스트', author: '플라이앤플레이', date: '16:56', views: 3, isNew: true },
        { id: 2, title: 'Test_리나', author: '플라이앤플레이', date: '2026.05.04', views: 4, isLock: true },
        { id: 1, title: '[개천절, 한글날 연휴 뉴뮨파티 몰디브] 2026년 10월 3일(토) - 10월 10일(토) 마이나 2', author: '플라이앤플레이', date: '2026.04.30', views: 64 },
    ];

    return (
        <div className="mt-2 overflow-x-auto">
            <div className="flex justify-between items-center mb-4 px-1">
                <span className="text-sm text-gray-600 font-medium">전체 {tours.length}</span>
                <select className="text-sm border-gray-300 rounded-md px-4 py-1.5 focus:ring-sky-500 focus:border-sky-500">
                    <option>최신순</option>
                    <option>조회순</option>
                </select>
            </div>

            <table className="w-full text-sm text-left border-t-2 border-gray-800">
                <thead className="bg-gray-50 border-b border-gray-200">
                    <tr className="hidden md:table-row">
                        <th className="px-4 py-3 font-semibold text-gray-700 w-20 text-center">번호</th>
                        <th className="px-4 py-3 font-semibold text-gray-700">제목</th>
                        <th className="px-4 py-3 font-semibold text-gray-700 w-32 text-center">작성자</th>
                        <th className="px-4 py-3 font-semibold text-gray-700 w-28 text-center">작성일</th>
                        <th className="px-4 py-3 font-semibold text-gray-700 w-16 text-center">조회</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {tours.map((tour) => (
                        <tr key={tour.id} className={`${tour.isNotice ? 'bg-sky-50/50' : 'hover:bg-gray-50'} transition cursor-pointer group`}>
                            <td className="hidden md:table-cell px-4 py-4 text-center text-gray-500">
                                {tour.isNotice ? <span className="text-sky-600 font-bold">공지</span> : tour.id}
                            </td>
                            <td className="px-4 py-4">
                                <div className="flex items-center gap-2">
                                    {tour.isNotice && <span className="md:hidden text-sky-600 font-bold text-xs">[공지]</span>}
                                    {tour.isNew && <span className="bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-sm font-bold animate-pulse">NEW</span>}
                                    {tour.isLock && <span className="text-gray-400">🔒</span>}
                                    <span className="text-gray-900 group-hover:text-sky-600 font-medium truncate">
                                        {tour.title}
                                    </span>
                                </div>
                                {/* 모바일용 정보 노출 */}
                                <div className="md:hidden mt-1 text-[11px] text-gray-400 flex gap-2">
                                    <span>{tour.author}</span>
                                    <span>|</span>
                                    <span>{tour.date}</span>
                                    <span>|</span>
                                    <span>조회 {tour.views}</span>
                                </div>
                            </td>
                            <td className="hidden md:table-cell px-4 py-4 text-center text-gray-600">{tour.author}</td>
                            <td className="hidden md:table-cell px-4 py-4 text-center text-gray-500">{tour.date}</td>
                            <td className="hidden md:table-cell px-4 py-4 text-center text-gray-500 font-mono">{tour.views}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="mt-6 flex justify-end gap-2 px-1">
                <button className="px-5 py-2 bg-white border border-gray-300 text-gray-700 rounded shadow-sm hover:bg-gray-50 transition text-sm font-medium">
                    검색
                </button>
                <Link
                    href="/tour/write"
                    className="px-5 py-2 bg-gray-800 text-white rounded shadow-sm hover:bg-gray-700 transition text-sm font-medium inline-block"
                >
                    글쓰기
                </Link>
            </div>
        </div>
    );
};

// --- 메인 페이지 컴포넌트 ---
export default function TourPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* 콘텐츠 섹션 */}
            <main className="max-w-6xl mx-auto px-4 py-16">
                {/* 상단 안내 문구 */}
                <div className="text-center mb-3">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 flex items-center justify-center gap-3">
                        <span className="w-6 h-0.5 bg-gray-300" />
                        TOUR LIST
                        <span className="w-6 h-0.5 bg-gray-300" />
                    </h2>
                    <div className="text-gray-600 leading-relaxed space-y-2 text-sm md:text-base">
                        <p>플라이앤플레이 공식 투어 뿐만 아니라</p>
                        <p>다양한 리브어보드 투어가 준비 되어있습니다.</p>
                        <p>투어 관련 문의는 <span className="font-bold text-sky-600 underline underline-offset-4 cursor-pointer">카톡 채널 '플라이앤플레이'</span>로 문의 주세요.</p>
                    </div>

                    {/* 카카오톡 채널 버튼 */}
                    <div className="mt-2 flex justify-center">
                        <a
                            href="http://pf.kakao.com/_ebxcAj/chat"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:scale-105 transition-transform duration-300 shadow-lg rounded-lg overflow-hidden"
                        >
                            {/* <Image
                                src="https://flynplay.co.kr/wp-content/uploads/2022/04/channel-0.png"
                                width={600}
                                height={76}
                                alt="카톡 채널 문의"
                                className="max-w-[300px] md:max-w-[500px] h-auto"
                            /> */}
                        </a>
                    </div>
                </div>
                <div className="w-full h-px bg-gray-100 my-12" />
                <TourTable />
            </main>

            {/* 푸터 영역 (선택사항) */}
            <footer className="bg-gray-50 border-t border-gray-200 py-10 text-center">
                <p className="text-xs text-gray-400">© 2026 FlyandPlay. All Rights Reserved.</p>
            </footer>
        </div>
    );
}