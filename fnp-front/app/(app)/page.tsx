import Image from "next/image";
import Link from "next/link";
import HeroSlider from "./HeroSlider";

const PRIMARY = "#409ad6";
const PRIMARY_2 = "#54a3da";
const PRIMARY_3 = "#69addf";

const NAV = [
  { label: "HOME", href: "/" },
  {
    label: "LIVEABOARD",
    href: "/?page_id=1413",
    children: [
      { label: "몰디브루트", href: "/?page_id=3329" },
      { label: "몰디브", href: "/?page_id=1885" },
      { label: "인도네시아", href: "/?page_id=2823" },
      { label: "필리핀", href: "/?page_id=2991" },
      { label: "말레이시아/팔라우", href: "/?page_id=3146" },
    ],
  },
  { label: "플플투어", href: "/?page_id=1299" },
  { label: "FLYandPLAY", href: "/?page_id=9" },
];

const FEATURES = [
  {
    icon: "👍",
    title: "섬세한 케어",
    bg: PRIMARY,
    body: (
      <>
        몰디브 및 리브어보드 투어만 15년을 한
        <br />
        플라이앤플레이의 세심한 다이빙 상담과 투어리딩,
        <br />
        특별한 투어케어를 받아보세요.
        <br />
        여러분의 특별한 휴가를 더욱 빛나게 만들어드립니다.
        <br />
        믿어보세요. 처음 경험하는 투어가 될 것입니다.
        <br />
        당신의 행복이 곧 우리의 행복입니다.
      </>
    ),
  },
  {
    icon: "📍",
    title: "최고의 포인트 안내",
    bg: PRIMARY_2,
    body: (
      <>
        시즌과 조류, 수온까지 고려한
        <br />
        플라이앤플레이만의 베스트 포인트 안내.
        <br />
        15년간 누비며 쌓아 온 현지 가이드 네트워크와
        <br />
        다이브 데이터로 매 시즌 가장 좋은 바다를 찾아드립니다.
        <br />
        같은 포인트도 플플과 함께라면 다르게 보입니다.
      </>
    ),
  },
  {
    icon: "🛟",
    title: "편안한 다이빙 투어",
    bg: PRIMARY_3,
    body: (
      <>
        보트 일정 조율부터 사전 브리핑,
        <br />
        장비·로그·식사·숙소 픽업까지
        <br />
        다이버는 다이빙에만 집중하실 수 있도록
        <br />
        모든 과정을 직접 챙겨드립니다.
        <br />
        편안하게, 그러나 가장 알차게.
      </>
    ),
  },
];

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col bg-white text-zinc-800">


      <main className="flex flex-1 flex-col">
        <HeroSlider />
        <Features />
        {/* <KakaoCTA /> */}
      </main>

      <SiteFooter />
    </div>
  );
}

function SiteHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-50 px-[4%] py-5">
      <div className="mx-auto flex w-full max-w-310 flex-wrap items-center">
        <div className="flex w-1/2 items-center justify-center md:w-1/4">
          <Link href="/" className="inline-block">
            <Image
              src="/main/FP-logo-1x.png"
              alt="FlyandPlay Logo"
              width={121}
              height={61}
              priority
              className="h-15.25 w-auto object-contain"
            />
          </Link>
        </div>

        <nav className="order-3 mt-4 flex w-full justify-center md:order-2 md:mt-0 md:w-1/2">
          <ul className="flex flex-wrap items-center justify-center gap-2 text-sm font-medium text-white">
            {NAV.map((item) => (
              <li key={item.label} className="group relative">
                <Link
                  href={item.href}
                  className="block rounded px-4 py-2 tracking-wide transition-colors hover:bg-white/10"
                >
                  {item.label}
                </Link>
                {item.children && (
                  <ul className="invisible absolute left-1/2 top-full min-w-45 -translate-x-1/2 translate-y-1 rounded-md bg-white py-2 text-zinc-700 opacity-0 shadow-xl ring-1 ring-zinc-200 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                    {item.children.map((child) => (
                      <li key={child.label}>
                        <Link
                          href={child.href}
                          className="block px-4 py-2 text-sm transition-colors hover:bg-sky-50 hover:text-sky-700"
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="order-2 hidden w-1/4 items-center justify-center gap-3 md:order-3 md:flex">
          <a
            href="https://www.facebook.com/profile.php?id=61552568638360"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="grid h-9 w-9 place-items-center text-white transition-opacity hover:opacity-70"
          >
            <FacebookIcon />
          </a>
          <a
            href="https://www.instagram.com/flynplay_paby/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="grid h-9 w-9 place-items-center text-white transition-opacity hover:opacity-70"
          >
            <InstagramIcon />
          </a>
        </div>
      </div>
    </header>
  );
}

function Features() {
  return (
    <section
      className="relative max-w-287.5 w-full mx-auto grid grid-cols-1 md:grid-cols-3 font-opensans"
      style={{ marginTop: "-50px" }}
    >
      {FEATURES.map((f) => (
        <article
          key={f.title}
          className="px-[10%] py-[10%] text-white md:py-[10%]"
          style={{ backgroundColor: f.bg }}
        >
          <header className="mb-4 flex items-center gap-3">
            <span className="text-3xl leading-none" aria-hidden="true">
              {f.icon}
            </span>
            <h2
              className="text-[24px] leading-tight"
              style={{ fontFamily: "nanumsquare, system-ui, sans-serif" }}
            >
              {f.title}
            </h2>
          </header>
          <p
            className="text-[10pt] leading-loose"
          >
            {f.body}
          </p>
        </article>
      ))}
    </section>
  );
}

function KakaoCTA() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto flex w-full max-w-290 flex-col items-center gap-6 px-6 text-center">
        <h2
          className="text-2xl font-semibold text-zinc-800 md:text-3xl"
          style={{ fontFamily: "nanumsquare, system-ui, sans-serif" }}
        >
          카톡에서 &lsquo;플라이앤플레이 채널&rsquo;을 추가하세요
        </h2>
        <a
          href="http://pf.kakao.com/_xexbnQK"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block transition-transform hover:-translate-y-0.5"
        >
          <Image
            src="/main/channel-0-400x51.png"
            alt="플라이앤플레이 카카오톡 채널 추가"
            width={400}
            height={51}
            className="h-auto w-75 object-contain md:w-100"
          />
        </a>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="bg-[#39394e] py-12 text-zinc-300">
      <div
        className="mx-auto w-full max-w-290 px-6 text-center text-[13px] leading-[1.9]"
        style={{ fontFamily: "nanumsquare, system-ui, sans-serif" }}
      >
        <p>
          상호: 플라이앤플레이 &nbsp;|&nbsp; 대표: 김재훈 &nbsp;|&nbsp;
          사업자등록번호: 496-28-00485
        </p>
        <p>
          주소: 서울 강서구 곰달래로 49길 17 3층 1호 &nbsp;|&nbsp; Tel.{" "}
          <a href="tel:+821042157774" className="hover:text-white">
            82-10-4215-7774
          </a>{" "}
          &nbsp;|&nbsp; E-mail.{" "}
          <a href="mailto:jhkim110@naver.com" className="hover:text-white">
            jhkim110@naver.com
          </a>
        </p>
        <p className="mt-3 text-xs text-zinc-400">
          Copyright © FlyandPlay. All Rights Reserved. Designed by Abyssblue.
        </p>
      </div>
    </footer>
  );
}

function FacebookIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}
