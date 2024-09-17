import { ChangeEvent, FC, FormEvent, useEffect, useState } from 'react';
import { UserType } from '../models/Auth/UserType';
import { Profile, UpdateUserProfileRequest } from '../models/Auth/Profile';
import { AuthServiceType } from '../Services/AuthService';
import { BlobServiceType } from '../Services/BlobService';
import { SHA256 } from 'crypto-js';
import {
	Box,
	TextField,
	Button,
	Select,
	MenuItem,
	InputLabel,
	FormControl,
	Typography,
	Avatar,
	SelectChangeEvent,
} from '@mui/material';

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

	const handleInputChange = (
		e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setFormData({
			...formData,
			[name]: value,
		});
	};

	const handleSelectChange = (e: SelectChangeEvent<UserType>) => {
		const { name, value } = e.target;
		setFormData({
			...formData,
			[name as keyof Profile]: value as string,
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
		<Box
			component='form'
			sx={{
				display: 'flex',
				flexDirection: 'column',
				gap: 2,
				maxWidth: 400,
				margin: 'auto',
			}}
			onSubmit={handleSubmit}
		>
			<TextField
				label='Username'
				value={formData.username}
				type='text'
				name='username'
				onChange={handleInputChange}
				fullWidth
				variant='outlined'
			/>

			<TextField
				label='Email'
				value={formData.email}
				type='email'
				name='email'
				onChange={handleInputChange}
				fullWidth
				variant='outlined'
				InputProps={{
					readOnly: true,
				}}
			/>

			<TextField
				label='Password'
				value={formData.password}
				type='password'
				name='password'
				onChange={handleInputChange}
				fullWidth
				variant='outlined'
			/>

			<TextField
				label='Full Name'
				value={formData.fullname}
				type='text'
				name='fullname'
				onChange={handleInputChange}
				fullWidth
				variant='outlined'
			/>

			<TextField
				label='Birth Date'
				value={formatDateForInput(formData.dateOfBirth)}
				type='date'
				name='dateOfBirth'
				onChange={handleInputChange}
				fullWidth
				variant='outlined'
			/>

			<TextField
				label='Address'
				value={formData.address}
				type='text'
				name='address'
				onChange={handleInputChange}
				fullWidth
				variant='outlined'
			/>

			<FormControl fullWidth variant='outlined'>
				<InputLabel id='userType-label'>User Type</InputLabel>
				<Select
					labelId='userType-label'
					id='userType'
					name='type'
					value={formData.type}
					label='User Type'
					onChange={handleSelectChange}
					disabled
				>
					<MenuItem value={UserType.Admin}>Administrator</MenuItem>
					<MenuItem value={UserType.Client}>User</MenuItem>
					<MenuItem value={UserType.Driver}>Driver</MenuItem>
				</Select>
			</FormControl>

			<Button variant='contained' component='label'>
				Upload Image
				<input
					type='file'
					hidden
					accept='image/*'
					onChange={handleImageChange}
				/>
			</Button>

			{formData.imagePath && (
				<Box sx={{ textAlign: 'center', mt: 2 }}>
					<Avatar
						sx={{ width: 100, height: 100 }}
						src={
							formData.imagePath instanceof File
								? URL.createObjectURL(formData.imagePath)
								: imageUrl
						}
						alt='Preview'
					/>
				</Box>
			)}

			<Button type='submit' variant='contained' color='primary'>
				Submit
			</Button>
		</Box>
	);
};

export default ProfilePage;
