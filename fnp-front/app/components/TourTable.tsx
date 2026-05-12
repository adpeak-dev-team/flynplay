// components/tour/TourTable.tsx
const dummyTours = [
    { id: 4, title: '2026/2027 플라이앤플레이 투어', author: '플라이앤플레이', date: '2026.05.04', views: 60, isNotice: true },
    { id: 3, title: '[연말] 몰디브 센트럴 7박 8일 $500 할인', author: '플라이앤플레이', date: '16:56', views: 3, isNew: true },
    // ... 추가 데이터
];

export default function TourTable() {
    return (
        <section className="mt-12 overflow-x-auto">
            <table className="w-full text-sm text-left border-t-2 border-gray-800">
                <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th className="px-4 py-3 font-medium text-gray-700 w-20 text-center">번호</th>
                        <th className="px-4 py-3 font-medium text-gray-700">제목</th>
                        <th className="px-4 py-3 font-medium text-gray-700 w-32 text-center">작성자</th>
                        <th className="px-4 py-3 font-medium text-gray-700 w-28 text-center">작성일</th>
                        <th className="px-4 py-3 font-medium text-gray-700 w-16 text-center">조회</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {dummyTours.map((tour) => (
                        <tr key={tour.id} className={`${tour.isNotice ? 'bg-blue-50/50' : 'hover:bg-gray-50'} transition cursor-pointer`}>
                            <td className="px-4 py-4 text-center text-gray-500">
                                {tour.isNotice ? <span className="font-bold text-blue-600">공지</span> : tour.id}
                            </td>
                            <td className="px-4 py-4 font-medium text-gray-800">
                                <div className="flex items-center gap-2">
                                    {tour.isNew && <span className="bg-orange-500 text-white text-[10px] px-1 rounded">New</span>}
                                    <span className="truncate">{tour.title}</span>
                                </div>
                            </td>
                            <td className="px-4 py-4 text-center text-gray-600">{tour.author}</td>
                            <td className="px-4 py-4 text-center text-gray-500">{tour.date}</td>
                            <td className="px-4 py-4 text-center text-gray-500">{tour.views}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* 글쓰기 버튼 */}
            <div className="mt-4 flex justify-end">
                <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition">
                    글쓰기
                </button>
            </div>
        </section>
    );
}