import "./style.css";
import { account } from "./appwrite";
import { OAuthProvider } from "appwrite";

const app = document.getElementById("app");
const loginBtn = document.getElementById("btn-siwg");

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
        app.innerHTML = `<h3>Hi ${user.name || user.email} 👋</h3>`;
    } catch (error) {
        console.error(error);
    }
};

init();

loginBtn.addEventListener("click", loginSIWG);
