const API_URL = "/Woodex/server/public/api.php";

function buildUrl(url, query = "") {
	return query ? `${url}${query}` : url;
}

function createApiError(message, details = {}) {
	const error = new Error(message);
	Object.assign(error, details);
	return error;
}

async function parseResponse(response, requestUrl) {
	const contentType = response.headers.get("content-type") || "";
	const text = await response.text();
	const trimmed = text.trim();
	let body = null;

	if (trimmed !== "") {
		const looksLikeJson = contentType.includes("application/json") || trimmed.startsWith("{") || trimmed.startsWith("[");

		if (looksLikeJson) {
			try {
				body = JSON.parse(trimmed);
			} catch (error) {
				throw createApiError("A resposta do servidor nao pode ser processada.", {
					requestUrl,
					responseType: "invalid-json",
				});
			}
		} else if (trimmed.startsWith("<")) {
			throw createApiError("A aplicacao nao conseguiu acessar a API corretamente.", {
				requestUrl,
				responseType: "html",
			});
		}
	}

	if (!response.ok) {
		const message = body && body.message ? body.message : `Falha na comunicacao com o servidor (${response.status}).`;
		throw createApiError(message, {
			requestUrl,
			responseType: "api-error",
			apiConfirmed: true,
			statusCode: response.status,
		});
	}

	return body;
}

async function requestApi(path = "", options = {}) {
	const requestUrl = buildUrl(API_URL, path);
	const response = await fetch(requestUrl, {
		credentials: "same-origin",
		...options,
	});
	return await parseResponse(response, requestUrl);
}

async function getSession() {
	return await requestApi("?action=session");
}

async function login(username, password) {
	return await requestApi("", {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: new URLSearchParams({
			action: "login",
			username,
			password,
		}),
	});
}

async function logout() {
	return await requestApi("", {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: new URLSearchParams({
			action: "logout",
		}),
	});
}

async function getEspecies() {
	return await requestApi();
}

async function addEspecie(especie) {
	return await requestApi("", {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: new URLSearchParams({
			action: "add",
			especie: JSON.stringify(especie),
		}),
	});
}

async function updateEspecie(id, especie) {
	return await requestApi("", {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: new URLSearchParams({
			action: "update",
			id: id,
			especie: JSON.stringify(especie),
		}),
	});
}

async function removeEspecie(id) {
	return await requestApi("", {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: new URLSearchParams({
			action: "delete",
			id: id,
		}),
	});
}

async function exportarEspecies() {
	// Download the JSON
	const especies = await getEspecies();
	const blob = new Blob([JSON.stringify(especies, null, 2)], { type: "application/json" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = "woods.json";
	a.click();
	URL.revokeObjectURL(url);
}

window.getEspecies = getEspecies;
window.addEspecie = addEspecie;
window.updateEspecie = updateEspecie;
window.removeEspecie = removeEspecie;
window.exportarEspecies = exportarEspecies;
window.getSession = getSession;
window.login = login;
window.logout = logout;
