import { IconCheck } from "./icons";

export function Toast({ message }: { message: string }) {
  return (
    <div
      role="status"
      className="absolute top-[76px] left-1/2 z-20 flex -translate-x-1/2 items-center gap-2.5 rounded-full py-2.5 ps-2.5 pe-[18px] text-[15px] font-bold whitespace-nowrap shadow-[0_10px_30px_rgba(0,0,0,.35)]"
      style={{ background: "var(--inv)", color: "var(--on-inv)", animation: "xl-in .25s ease-out" }}
    >
      <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[#C6FF3D] text-[#0D0F0C]">
        <IconCheck width={15} height={15} />
      </span>
      <span>{message}</span>
    </div>
  );
}
