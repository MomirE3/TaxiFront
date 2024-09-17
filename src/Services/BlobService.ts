import axios from 'axios';

const BLOB_CONTROLLER_URL = `${process.env.REACT_APP_BACKEND_URL}/blob`;

async function UploadProfileImage(formData: FormData, hashedEmail: string) {
	try {
		const res = await axios.post(
			`${BLOB_CONTROLLER_URL}/upload-profile-image/${hashedEmail}`,
			formData,
			{
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			}
		);
		return res.data;
	} catch (error) {
		console.error(error);
		return null;
	}
}

async function GetImageUrl(blobName: string) {
	try {
		const res = await axios.get(
			`${BLOB_CONTROLLER_URL}/get-image-sas/${blobName}`,
			{
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			}
		);
		return res.data;
	} catch (error) {
		console.error(error);
		return null;
	}
}

export type BlobServiceType = {
	UploadProfileImage: (
		formData: FormData,
		hashedEmail: string
	) => Promise<null | any>;
	GetImageUrl: (blobName: string) => Promise<null | any>;
};

export const BlobService: BlobServiceType = {
	UploadProfileImage,
	GetImageUrl,
};
