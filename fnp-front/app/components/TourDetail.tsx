// components/tour/TourDetail.tsx
import Image from 'next/image';

interface TourDetailProps {
    title: string;
    date: string;
    contentImage: string;
}

export default function TourDetail({ title, date, contentImage }: TourDetailProps) {
    return (
        <article className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            {/* 헤더 */}
            <header className="bg-gray-50 border-b border-gray-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-xl font-bold text-gray-800 leading-tight">
                    {title}
                </h2>
                <time className="text-sm text-gray-500 whitespace-nowrap">{date}</time>
            </header>

            {/* 본문 */}
            <div className="p-6">
                <div className="flex justify-center mb-8">
                    <img
                        src={contentImage}
                        alt="Tour Promotion"
                        className="max-w-full h-auto rounded shadow-md"
                    />
                </div>

                {/* 설명/문의 안내 */}
                <div className="text-center space-y-4 border-t pt-8">
                    <p className="text-gray-600">
                        플라이앤플레이 공식 투어 뿐만 아니라<br />
                        다양한 리브어보드 투어가 준비 되어있습니다.
                    </p>
                    <a
                        href="http://pf.kakao.com/_ebxcAj/chat"
                        className="inline-block hover:opacity-90 transition"
                    >
                        <Image
                            src="https://flynplay.co.kr/wp-content/uploads/2022/04/channel-0.png"
                            width={400}
                            height={50}
                            alt="카톡 문의하기"
                        />
                    </a>
                </div>
            </div>

            {/* 목록 버튼 */}
            <footer className="p-6 border-t border-gray-100 flex justify-end">
                <button className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition">
                    목록
                </button>
            </footer>
        </article>
    );
}