import { ChangeEvent, FC, FormEvent, useEffect, useState } from 'react';
import { UserType } from '../models/Auth/UserType';
import { Profile, UpdateUserProfileRequest } from '../models/Auth/Profile';
import { AuthServiceType } from '../Services/AuthService';
import { BlobServiceType } from '../Services/BlobService';
import { SHA256 } from 'crypto-js';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';

interface IProps {
	authService: AuthServiceType;
	blobService: BlobServiceType;
}

const ProfilePage: FC<IProps> = (props) => {
	const [formData, setFormData] = useState<Profile>({
		username: '',
		email: '',
		password: '',
		fullname: '',
		dateOfBirth: '',
		address: '',
		type: UserType.Admin,
		imagePath: '' as string | File,
	});
	const [originalData, setOriginalData] = useState<Profile>(formData);
	const [localImagePath, setLocalImagePath] = useState<string | File>('');
	const [localImageName, setLocalImageName] = useState<string | undefined>(
		undefined
	);
	const [imageUrl, setImageUrl] = useState('');

	function getLastPartOfUrl(url: string) {
		const parts = url.split('/');
		const lastPart = parts[parts.length - 1];
		return lastPart;
	}

	useEffect(() => {
		const fetchProfile = async () => {
			const data = await props.authService.GetProfile();
			if (data) {
				setFormData({ ...data, password: '' });
				setOriginalData(data);
			}
		};
		fetchProfile();
	}, [props.authService]);

	useEffect(() => {
		const fetchImage = async () => {
			if (typeof formData.imagePath === 'string') {
				const blobName = getLastPartOfUrl(formData.imagePath as string);
				const data = await props.blobService.GetImageUrl(blobName);
				if (data) {
					setImageUrl(data);
				}
			}
		};

		fetchImage();
	}, [props.blobService, formData.imagePath]);

	const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData({
			...formData,
			[name]: value,
		});
	};

	const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			setFormData({
				...formData,
				imagePath: e.target.files[0],
			});
			setLocalImageName(e.target.files[0].name);
			setLocalImagePath(e.target.files[0]);
		}
	};

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const updatedData: UpdateUserProfileRequest = {};

		for (const key in formData) {
			if (
				formData[key as keyof Profile] !==
				originalData[key as keyof Profile]
			) {
				if (key !== 'password' || formData.password) {
					(updatedData as any)[key] = formData[key as keyof Profile];
				}
			}
		}

		if (localImagePath instanceof File) {
			const formDataReq = new FormData();
			formDataReq.append('file', localImagePath);
			formDataReq.append('fileName', localImageName!);
			const hashedEmail = SHA256(formData.email).toString();

			try {
				const uploadImgRes = await props.blobService.UploadProfileImage(
					formDataReq,
					hashedEmail
				);
				updatedData.imagePath = uploadImgRes;
			} catch (error) {
				alert('Failed to upload the image. Please try again.');
				return;
			}
		}

		try {
			await props.authService.UpdateProfile(updatedData);
			alert('Profile updated successfully!');
		} catch (error) {
			alert('Failed to update the profile. Please try again.');
		}
	};

	function formatDateForInput(dateString: string) {
		if (!dateString) return getDefaultDate();

		const date = new Date(dateString);

		if (isNaN(date.getTime()) || date.getFullYear() < 1000) {
			return getDefaultDate();
		}

		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	}

	function getDefaultDate() {
		const today = new Date();
		const year = today.getFullYear();
		const month = String(today.getMonth() + 1).padStart(2, '0');
		const day = String(today.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	}

	return (
		<Container>
			<Form onSubmit={handleSubmit}>
				<Form.Group controlId='formUsername'>
					<Form.Label>Username</Form.Label>
					<Form.Control
						type='text'
						name='username'
						value={formData.username}
						onChange={handleInputChange}
					/>
				</Form.Group>

				<Form.Group controlId='formEmail' className='mt-3'>
					<Form.Label>Email</Form.Label>
					<Form.Control
						type='email'
						name='email'
						value={formData.email}
						readOnly
					/>
				</Form.Group>

				<Form.Group controlId='formPassword' className='mt-3'>
					<Form.Label>Password</Form.Label>
					<Form.Control
						type='password'
						name='password'
						value={formData.password}
						onChange={handleInputChange}
					/>
				</Form.Group>

				<Form.Group controlId='formFullname' className='mt-3'>
					<Form.Label>Full Name</Form.Label>
					<Form.Control
						type='text'
						name='fullname'
						value={formData.fullname}
						onChange={handleInputChange}
					/>
				</Form.Group>

				<Form.Group controlId='formDateOfBirth' className='mt-3'>
					<Form.Label>Birth Date</Form.Label>
					<Form.Control
						type='date'
						name='dateOfBirth'
						value={formatDateForInput(formData.dateOfBirth)}
						onChange={handleInputChange}
					/>
				</Form.Group>

				<Form.Group controlId='formAddress' className='mt-3'>
					<Form.Label>Address</Form.Label>
					<Form.Control
						type='text'
						name='address'
						value={formData.address}
						onChange={handleInputChange}
					/>
				</Form.Group>

				<Form.Group controlId='formImage' className='mt-3'>
					<Form.Label>Upload Image</Form.Label>
					<Form.Control
						type='file'
						onChange={handleImageChange}
						accept='image/*'
					/>
				</Form.Group>

				{formData.imagePath && (
					<div className='mt-3 text-center'>
						<img
							src={
								formData.imagePath instanceof File
									? URL.createObjectURL(formData.imagePath)
									: imageUrl
							}
							alt='Profile'
							style={{
								width: '100px',
								height: '100px',
								borderRadius: '50%',
							}}
						/>
					</div>
				)}

				<Button className='mt-3' type='submit'>
					Submit
				</Button>
			</Form>
		</Container>
	);
};

export default ProfilePage;
