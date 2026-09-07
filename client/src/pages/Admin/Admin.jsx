import { Link } from "react-router-dom";


function Admin() {


  const stats = [

    {
      title: "Total Students",
      value: "850",
      icon: "👨‍🎓"
    },

    {
      title: "Instructors",
      value: "45",
      icon: "👨‍🏫"
    },

    {
      title: "Courses",
      value: "120",
      icon: "📚"
    },

    {
      title: "Announcements",
      value: "25",
      icon: "📢"
    }

  ];




  const actions = [

    {
      title: "Manage Users",
      path: "/students",
      icon: "👥"
    },

    {
      title: "Manage Courses",
      path: "/manage-courses",
      icon: "📚"
    },

    {
      title: "Manage Modules",
      path: "/manage-modules",
      icon: "📂"
    },

    {
      title: "Manage Assignments",
      path: "/manage-assignments",
      icon: "📝"
    },

    {
      title: "Announcements",
      path: "/announcements",
      icon: "📢"
    },

    {
      title: "Settings",
      path: "/settings",
      icon: "⚙️"
    }

  ];





  return (

    <div className="space-y-6">


      {/* Header */}

      <div>

        <h1 className="text-3xl font-bold">
          Admin Dashboard 👑
        </h1>


        <p className="text-gray-500 mt-2">
          Manage the entire AJ Learning Hub system.
        </p>

      </div>






      {/* Statistics */}


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








      {/* Admin Actions */}


      <div className="bg-white rounded-xl shadow p-6">


        <h2 className="text-xl font-bold mb-5">
          Administration Tools
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


export default Admin;