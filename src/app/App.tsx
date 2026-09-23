import { TypingTest } from './components/TypingTest';

function Header() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Header">
      <div className="[word-break:break-word] content-stretch flex items-center justify-between leading-[0] relative shrink-0 text-[#011c30] text-[22px] w-full whitespace-nowrap">
        <div className="flex flex-col font-['Roboto_Mono',sans-serif] font-bold justify-center relative shrink-0">
          <p className="leading-[30px]">1-minute typing test</p>
        </div>
        <div className="flex flex-col font-['Roboto_Mono',sans-serif] font-normal justify-center relative shrink-0">
          <p className="leading-[30px]">Product Designer</p>
        </div>
      </div>
      <div className="h-0 relative shrink-0 w-full">
        <div className="absolute inset-[-1px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1392 1">
            <line stroke="#011C30" x2="1392" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start py-[16px] relative shrink-0 w-full" data-name="Footer">
      <div className="h-[32px] relative shrink-0 w-full">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1102 32.0001">
          <line stroke="#011C30" x1="4.37114e-08" x2="1102" y1="15.5" y2="15.5001" />
        </svg>
      </div>
      <div className="content-stretch flex items-start relative shrink-0 w-full">
        <div className="content-stretch flex flex-[1_0_0] flex-col gap-[8px] items-start min-w-px relative">
          <div className="[word-break:break-word] flex flex-col font-['Roboto_Mono',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#011c30] text-[18px] w-full">
            <p className="leading-[30px]">Created by Oliver Ellis</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div className="bg-[#fdfdfd] min-h-screen flex flex-col items-start pt-[16px] px-[24px] relative" data-name="Home page">
      <div className="content-stretch flex flex-col items-start relative shrink-0 w-full max-w-[1392px]">
        <Header />
        <div className="content-stretch flex flex-col gap-[65px] items-start pt-[24px] relative shrink-0 w-full">
          <TypingTest />
          <Footer />
        </div>
      </div>
    </div>
  );
}