import {
  BookOpen,
  FileText,
  GraduationCap,
  Bell,
} from "lucide-react";

const stats = [
  {
    title: "My Courses",
    value: 6,
    icon: BookOpen,
    color: "bg-blue-500",
  },
  {
    title: "Assignments",
    value: 12,
    icon: FileText,
    color: "bg-orange-500",
  },
  {
    title: "Completed",
    value: 38,
    icon: GraduationCap,
    color: "bg-green-500",
  },
  {
    title: "Announcements",
    value: 4,
    icon: Bell,
    color: "bg-purple-500",
  },
];

function StatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

      {stats.map((card) => {

        const Icon = card.icon;

        return (

          <div
            key={card.title}
            className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-lg transition"
          >

            <div className="flex justify-between items-center">

              <div>

                <p className="text-gray-500 text-sm">
                  {card.title}
                </p>

                <h2 className="text-3xl font-bold mt-2">
                  {card.value}
                </h2>

              </div>

              <div
                className={`${card.color} p-4 rounded-xl text-white`}
              >
                <Icon size={28} />
              </div>

            </div>

          </div>

        );

      })}

    </div>
  );
}

export default StatsCards;