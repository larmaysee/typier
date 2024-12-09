import AdsBlock from "@/components/ads-block";
import DataBox from "@/components/data-box";
import Keyboard from "@/components/keyboard";
import SiteToolbox from "@/components/site-toolbox";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <>
      <div className={cn("flex flex-col gap-4 min-h-screen")}>
        <div className="grid col-span-3 gap-2 h-full">
          <SiteToolbox />

          <div className="flex flex-col gap-4 w-full md:max-w-[800px] md:m-auto sm:p-4">
            <AdsBlock />
            <DataBox />
            <Keyboard />
          </div>
        </div>
      </div>
    </>
  );
}
