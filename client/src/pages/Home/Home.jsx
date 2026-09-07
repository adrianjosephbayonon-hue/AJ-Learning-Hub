import { Link } from "react-router-dom";


function Home() {


  const courses = [
    {
      title: "Web Development",
      description: "HTML, CSS, JavaScript & React",
      icon: "💻"
    },

    {
      title: "Database Systems",
      description: "MySQL & PostgreSQL",
      icon: "🗄️"
    },

    {
      title: "Programming Languages",
      description: "C++, Java & Python",
      icon: "👨‍💻"
    }
  ];



  return (

    <div className="min-h-screen bg-gray-50">


      {/* Navbar */}

      <nav className="bg-white shadow px-8 py-4 flex justify-between items-center">


        <h1 className="text-2xl font-bold text-blue-600">
          AJ Learning Hub
        </h1>



        <div className="flex gap-6">


          <Link 
            to="/"
            className="hover:text-blue-600"
          >
            Home
          </Link>


          <Link 
            to="/login"
            className="hover:text-blue-600"
          >
            Login
          </Link>


          <Link 
            to="/register"
            className="hover:text-blue-600"
          >
            Register
          </Link>


          <Link 
            to="/dashboard"
            className="hover:text-blue-600"
          >
            Dashboard
          </Link>


        </div>


      </nav>





      {/* Hero Section */}

      <section className="bg-blue-600 text-white py-20 px-8 text-center">


        <h1 className="text-5xl font-bold">
          Learn. Share. Grow.
        </h1>


        <p className="mt-5 text-lg text-blue-100">

          A complete learning portal for students and instructors.

        </p>




        <div className="mt-8 flex justify-center gap-5">


          <Link
            to="/login"
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold"
          >
            Login
          </Link>



          <Link
            to="/register"
            className="border border-white px-6 py-3 rounded-lg font-semibold"
          >
            Register
          </Link>


        </div>


      </section>







      {/* Courses */}


      <section className="p-8">


        <h2 className="text-3xl font-bold text-center mb-8">

          Featured Courses

        </h2>




        <div className="grid md:grid-cols-3 gap-6">


          {
            courses.map((course,index)=>(


              <div
                key={index}
                className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition"
              >


                <div className="text-5xl">

                  {course.icon}

                </div>



                <h3 className="text-xl font-bold mt-4">

                  {course.title}

                </h3>



                <p className="text-gray-500 mt-2">

                  {course.description}

                </p>



              </div>


            ))
          }


        </div>


      </section>



    </div>

  );

}


export default Home;