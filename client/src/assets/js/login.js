import "./services/storage.js";

document.addEventListener("DOMContentLoaded", () => {
	const form = document.getElementById("loginForm");
	const usernameInput = document.getElementById("username");
	const passwordInput = document.getElementById("password");
	const submitBtn = document.getElementById("loginBtn");
	const feedback = document.getElementById("loginFeedback");

	function mostrarMensagem(texto, tipo = "") {
		feedback.textContent = texto;
		feedback.className = tipo ? `login-feedback ${tipo}` : "login-feedback";
	}

	function irParaAplicacao() {
		window.location.href = "/Woodex/client/public/index.html";
	}

	(async () => {
		try {
			const session = await window.getSession();

			if (session?.authenticated) {
				irParaAplicacao();
			}
		} catch (error) {
			mostrarMensagem("Nao foi possivel verificar a sessao atual.", "erro");
		}
	})();

	form.onsubmit = async (event) => {
		event.preventDefault();

		mostrarMensagem("");
		submitBtn.disabled = true;

		try {
			await window.login(usernameInput.value.trim(), passwordInput.value);
			mostrarMensagem("Login realizado com sucesso.", "sucesso");
			irParaAplicacao();
		} catch (error) {
			mostrarMensagem(error.message || "Nao foi possivel entrar.", "erro");
		} finally {
			submitBtn.disabled = false;
		}
	};
});
