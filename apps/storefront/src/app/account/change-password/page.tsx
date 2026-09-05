import type { Metadata } from "next";
import ChangePasswordView from "./change-password-view";

export const metadata: Metadata = {
  title: "Change Password",
};

export default function Page() {
  return <ChangePasswordView />;
}
