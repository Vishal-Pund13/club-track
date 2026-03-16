import Sidebar from "@/components/Sidebar";
import MainPanel from "@/components/MainPanel";
import RightPanel from "@/components/RightPanel";
import MobileTabBar from "@/components/MobileTabBar";

export default function OpsPage() {
  return (
    <>
      <div className="app-grid">
        <Sidebar />
        <MainPanel />
        <RightPanel />
      </div>
      <MobileTabBar />
    </>
  );
}
