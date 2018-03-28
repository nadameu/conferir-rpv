export default function buscarDocumento(url) {
	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		xhr.open('GET', url);
		xhr.responseType = 'document';
		xhr.addEventListener('load', evt => resolve(evt.target.response));
		xhr.addEventListener('error', reject);
		xhr.send(null);
	});
}
