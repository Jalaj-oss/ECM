import { Outlet } from "react-router-dom";

const Admin =()=> {
    return (
        <div className="min-h-screen">
<header className="border-b p-4">
    <h1 className="text-xl font-bold">EHMS Admin</h1>
</header>
<main>
    <Outlet/>
</main>
        </div>
    )
}
export default Admin;