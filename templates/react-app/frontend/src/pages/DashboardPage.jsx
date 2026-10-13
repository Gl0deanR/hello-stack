import { useAuth } from "../context/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-slate-600">
        Welcome back{user?.full_name ? `, ${user.full_name}` : ""}. This is your
        starting point — wire up your real screens here.
      </p>
    </div>
  );
}
