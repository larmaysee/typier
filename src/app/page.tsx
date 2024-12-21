import { AuthProvider } from "@/components/auth-provider";
import SiteFooter from "@/components/site-footer";
import SiteToolbox from "@/components/site-toolbox";
import TestUi from "@/components/test-ui";

export default function Home() {
  return (
    <>
      <AuthProvider>
        <div className="grid grid-rows-[auto,1fr,auto] col-span-3 gap-2 min-h-screen">
          <SiteToolbox />

          <div className="flex flex-col gap-4 w-full md:max-w-[800px] md:m-auto sm:p-4">
            {/* <AdsBlock /> */}
            <TestUi />
          </div>
          <SiteFooter />
        </div>
      </AuthProvider>
    </>
  );
}
