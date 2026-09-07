import { Link } from "react-router-dom";


function NotFound() {

  return (

    <div className="min-h-screen bg-gray-100 flex items-center justify-center">


      <div className="text-center">


        <h1 className="text-8xl font-bold text-blue-600">
          404
        </h1>


        <h2 className="text-3xl font-bold mt-4">
          Page Not Found
        </h2>


        <p className="text-gray-500 mt-3">
          Sorry, the page you are looking for does not exist.
        </p>




        <Link

          to="/"

          className="inline-block mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"

        >

          Back To Home

        </Link>


      </div>


    </div>

  );

}


export default NotFound;