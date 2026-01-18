import "./style.css";
import { account } from "./appwrite";
import { OAuthProvider } from "appwrite";

const app = document.getElementById("app");
const loginBtn = document.getElementById("btn-siwg");

if (!app || !loginBtn) {
    throw new Error("Required elements 'app' or 'btn-siwg' not found.");
}

const successRedirect =
    import.meta.env.VITE_OAUTH_SUCCESS_URL || window.location.origin;
const failureRedirect =
    import.meta.env.VITE_OAUTH_FAILURE_URL || window.location.origin;

const loginSIWG = async () => {
    try {
        await account.createOAuth2Session(
            OAuthProvider.Google,
            successRedirect,
            failureRedirect
        );
    } catch (error) {
        console.error("Google sign-in failed", error);
    }
};

const init = async () => {
    try {
        const user = await account.get();
        const heading = document.createElement('h3');
        heading.textContent = `Hi ${user.name || user.email} 👋`;
        app.innerHTML = '';
        app.appendChild(heading);
    } catch (error) {
        console.error(error);
    }
};

init();

loginBtn.addEventListener("click", loginSIWG);
