import React from 'react';

export default function TourLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            {/* 1. 히어로 섹션 (페이지 타이틀 바) */}
            <section className="relative h-87.5 md:h-112.5 flex items-center justify-center overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-fixed z-0"
                    style={{ backgroundImage: "url('https://flynplay.co.kr/wp-content/uploads/2022/03/LB_BG_o.jpg')" }}
                >
                    <div className="absolute inset-0 bg-black/45" />
                </div>
                <div className="relative z-10 text-center px-4">
                    <div className="flex items-center justify-center gap-4 mb-2">
                        <div className="w-8 md:w-16 h-px bg-white/50" />
                        <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-widest drop-shadow-md font-sans">
                            TOUR
                        </h1>
                        <div className="w-8 md:w-16 h-px bg-white/50" />
                    </div>
                    <p className="text-white/80 text-sm md:text-base font-light tracking-widest">FLY AND PLAY OFFICIAL TOUR</p>
                </div>
            </section>

            {children}
        </>
    );
}
