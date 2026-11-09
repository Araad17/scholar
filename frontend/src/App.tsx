import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import AdminDashboard from "./components/AdminDashboard";
import UserDashboard from "./components/UserDashboard";
import { Role, getToken, getUser, homeFor } from "./api";
import Home from "./pages/Home";
import Scholarships from "./pages/Scholarships";
import Guide from "./pages/Guide";
import Detail from "./pages/Detail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UHome from "./pages/user/UHome";
import UProfile from "./pages/user/UProfile";
import UDocuments from "./pages/user/UDocuments";
import UMeet from "./pages/user/UMeet";
import UReferral from "./pages/user/UReferral";
import AOverview from "./pages/admin/AOverview";
import AUsers from "./pages/admin/AUsers";
import ADocuments from "./pages/admin/ADocuments";
import AMeetings from "./pages/admin/AMeetings";
import AdminList from "./pages/AdminList";
import AdminForm from "./pages/AdminForm";
import { translate as t } from "./i18n";

function RequireRole({
	role,
	children,
}: {
	role: Role;
	children: JSX.Element;
}) {
	const u = getUser();
	if (!getToken() || !u) return <Navigate to="/login" replace />;
	if (u.role !== role) return <Navigate to={homeFor(u)} replace />;
	return children;
}

export default function App() {
	return (
		<Routes>
			<Route element={<Layout />}>
				<Route path="/" element={<Home />} />
				<Route path="/scholarships" element={<Scholarships />} />
				<Route path="/guide" element={<Guide />} />
				<Route path="/scholarships/:id" element={<Detail />} />
				<Route path="/login" element={<Login />} />
				<Route path="/register" element={<Register />} />

			</Route>

			<Route
				path="/admin"
				element={
					<RequireRole role="admin">
						<AdminDashboard />
					</RequireRole>
				}
			>
				<Route index element={<AOverview />} />
				<Route path="scholarships" element={<AdminList />} />
				<Route path="scholarships/new" element={<AdminForm />} />
				<Route path="scholarships/edit/:id" element={<AdminForm />} />
				<Route path="users" element={<AUsers />} />
				<Route path="documents" element={<ADocuments />} />
				<Route path="meetings" element={<AMeetings />} />
			</Route>

			<Route path="/admin/login" element={<Navigate to="/login" replace />} />

			<Route
				path="/dashboard"
				element={
					<RequireRole role="user">
						<UserDashboard />
					</RequireRole>
				}
			>
				<Route index element={<UHome />} />
				<Route path="profile" element={<UProfile />} />
				<Route path="documents" element={<UDocuments />} />
				<Route path="meet" element={<UMeet />} />
				<Route path="referral" element={<UReferral />} />
			</Route>

			<Route path="*" element={<p className="py-20 text-center">{t("صفحه پیدا نشد.")}</p>} />
		</Routes>
	);
}
