import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-blue-600 p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">Wonder Finance</h1>
        <div>
          <Link href="/dashboard">
            <a className="mr-4">Dashboard</a>
          </Link>
          <Link href="/login">
            <a className="mr-4">Login</a>
          </Link>
        </div>
      </div>
    </nav>
  );
}
