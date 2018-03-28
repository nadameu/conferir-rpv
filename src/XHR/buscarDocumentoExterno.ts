export default function buscarDocumentoExterno(url) {
	return new Promise((resolve, reject) => {
		const options = {
			method: 'GET',
			url: url,
			responseType: 'document',
			onload: obj => resolve(obj.responseXML),
			onerror: reject,
		};
		GM_xmlhttpRequest(options);
	});
}
