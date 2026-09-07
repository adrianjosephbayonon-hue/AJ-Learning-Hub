import { Link } from "react-router-dom";


function Instructor() {

  const stats = [
    {
      title: "Courses",
      value: "5",
      icon: "📚"
    },

    {
      title: "Students",
      value: "120",
      icon: "👨‍🎓"
    },

    {
      title: "Assignments",
      value: "18",
      icon: "📝"
    },

    {
      title: "Modules",
      value: "32",
      icon: "📂"
    }
  ];



  const actions = [
    {
      title: "Create Course",
      path: "/create-course",
      icon: "➕"
    },

    {
      title: "Manage Courses",
      path: "/manage-courses",
      icon: "📚"
    },

    {
      title: "Upload Module",
      path: "/upload-module",
      icon: "📤"
    },

    {
      title: "Manage Assignments",
      path: "/manage-assignments",
      icon: "📝"
    },

    {
      title: "Students",
      path: "/students",
      icon: "👨‍🎓"
    },

    {
      title: "Announcements",
      path: "/announcements",
      icon: "📢"
    }
  ];



  return (

    <div className="space-y-6">



      {/* Header */}

      <div>

        <h1 className="text-3xl font-bold">
          Instructor Dashboard 👨‍🏫
        </h1>


        <p className="text-gray-500 mt-2">
          Manage your courses and students.
        </p>


      </div>





      {/* Stats */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">


        {
          stats.map((stat,index)=>(

            <div
              key={index}
              className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition"
            >

              <div className="flex justify-between">


                <div>

                  <p className="text-gray-500">
                    {stat.title}
                  </p>


                  <h2 className="text-3xl font-bold mt-2">
                    {stat.value}
                  </h2>


                </div>



                <span className="text-4xl">
                  {stat.icon}
                </span>


              </div>


            </div>

          ))
        }


      </div>







      {/* Quick Actions */}

      <div className="bg-white rounded-xl shadow p-6">


        <h2 className="text-xl font-bold mb-5">
          Quick Actions
        </h2>



        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">


          {
            actions.map((action,index)=>(

              <Link

                key={index}

                to={action.path}

                className="border rounded-xl p-5 hover:bg-blue-50 transition"

              >

                <div className="text-3xl mb-3">

                  {action.icon}

                </div>


                <h3 className="font-semibold">

                  {action.title}

                </h3>


              </Link>

            ))
          }


        </div>


      </div>



    </div>

  );

}


export default Instructor;