"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const NAV_LINKS = [
    { href: "/", label: "HOME" },
    { href: "/liveboard", label: "LIVEABOARD" },
    { href: "/tour", label: "플플투어" },
    { href: "/fly-and-play", label: "FLY and PLAY" },
];

export default function SiteHeader() {
    const [open, setOpen] = useState(false);

    return (
        <div className="absolute left-0 top-0 z-9999 w-full font-opensans">
            {/* Desktop (lg+) */}
            <div className="py-5 px-12 w-full hidden lg:flex justify-center items-center">
                <div className="logo-area flex-11 flex justify-center">
                    <Image src="/main/FP-logo-1x.png" alt="FlyandPlay Logo" width={121} height={61} priority className="h-15.25 w-auto object-contain" />
                </div>
                <div className="menu-area flex-24 flex justify-center text-white gap-4">
                    {NAV_LINKS.map((l) => (
                        <Link key={l.label} href={l.href} className="hover:bg-[#52a4da] px-4 py-3 rounded">
                            <span>{l.label}</span>
                        </Link>
                    ))}
                </div>
                <div className="share-area flex-11 flex justify-center">
                    공유!!
                </div>
            </div>

            {/* Mobile (<lg) */}
            <div className="lg:hidden">
                <div className="py-3 px-4 w-full flex justify-between items-center">
                    <Image src="/main/FP-logo-1x.png" alt="FlyandPlay Logo" width={121} height={61} priority className="h-12 w-auto object-contain" />
                    <button
                        type="button"
                        aria-label="Toggle menu"
                        aria-expanded={open}
                        onClick={() => setOpen((v) => !v)}
                        className="relative w-10 h-10 flex flex-col justify-center items-center gap-1.5"
                    >
                        <span className={`block h-0.5 w-7 bg-white transition-transform duration-300 ${open ? "translate-y-2 rotate-45" : ""}`} />
                        <span className={`block h-0.5 w-7 bg-white transition-opacity duration-300 ${open ? "opacity-0" : "opacity-100"}`} />
                        <span className={`block h-0.5 w-7 bg-white transition-transform duration-300 ${open ? "-translate-y-2 -rotate-45" : ""}`} />
                    </button>
                </div>

                <div
                    className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
                >
                    <nav className="flex flex-col bg-black/60 backdrop-blur-sm">
                        {NAV_LINKS.map((l) => (
                            <Link
                                key={l.label}
                                href={l.href}
                                onClick={() => setOpen(false)}
                                className="px-6 py-4 text-white border-t border-white/10 hover:bg-[#52a4da]"
                            >
                                {l.label}
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>
        </div>
    );
}
