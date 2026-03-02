import { Link } from 'react-router-dom';

const Home = () => (
  <div className="p-20 text-center bg-slate-50 min-h-screen">
    <h1 className="text-4xl font-black mb-8">SOP & Guidelines</h1>
    <Link to="/login" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold">
      Agree & Go to Login
    </Link>
  </div>
);

export default Home;
