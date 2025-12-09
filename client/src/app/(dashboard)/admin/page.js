import NoticeBoard from "@/components/NoticeBoard";
import AttendanceChart from "@/components/AttendanceChart";
import CountChart from "@/components/CountChart";
import EventCalendar from "@/components/EventCalendar";
import FinanceChart from "@/components/FinanceChart";
import UserCard from "@/components/UserCard";

const AdminPage = () => {
  return (
    <div className="p-2 sm:p-4 md:p-6 flex gap-3 sm:gap-4 flex-col xl:flex-row">
      {/* LEFT SECTION */}
      <div className="w-full xl:w-2/3 flex flex-col gap-4 sm:gap-6 lg:gap-8">
        {/* USER CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          <UserCard type="" />
          <UserCard type="student" />
          <UserCard type="faculty" />
          <UserCard type="staff" />
        </div>
        
        {/* MIDDLE CHARTS */}
        <div className="flex gap-3 sm:gap-4 flex-col lg:flex-row">
          {/* COUNT CHART */}
          <div className="w-full lg:w-1/3 h-[350px] sm:h-[400px] lg:h-[450px]">
            <CountChart />
          </div>
          {/* ATTENDANCE CHART */}
          <div className="w-full lg:w-2/3 h-[350px] sm:h-[400px] lg:h-[450px]">
            <AttendanceChart />
          </div>
        </div>
        
        {/* BOTTOM CHART */}
        <div className="w-full h-[350px] sm:h-[400px] md:h-[450px] lg:h-[500px]">
          <FinanceChart />
        </div>
      </div>
      
      {/* RIGHT SECTION */}
      <div className="w-full xl:w-1/3 flex flex-col gap-4 sm:gap-6 lg:gap-8">
        <EventCalendar />
        <NoticeBoard />
      </div>
    </div>
  );
};

export default AdminPage;
