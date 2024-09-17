import { ChangeEvent, FC, useEffect, useState } from 'react';
import { RegisterData } from '../models/Auth/RegisterData';
import { UserType } from '../models/Auth/UserType';
import { EMAIL_REGEX, PASSWORD_REGEX } from '../utils/Regex';
import { AuthServiceType } from '../Services/AuthService';
import { Link, useNavigate } from 'react-router-dom';
import { RoutesNames } from '../Router/Routes';
import { BlobServiceType } from '../Services/BlobService';
import { SHA256 } from 'crypto-js';
import { GoogleAuth } from '../components/auth/GoogleAuth';
import { GoogleAuthService } from '../Services/Google/GoogleAuth';
import {
	Box,
	TextField,
	Button,
	Typography,
	Radio,
	RadioGroup,
	FormControlLabel,
	FormControl,
	FormLabel,
} from '@mui/material';

interface IProps {
	authService: AuthServiceType;
	blobService: BlobServiceType;
}

export const RegisterPage: FC<IProps> = (props) => {
	const navigate = useNavigate();

	const [registerFormData, setRegisterFormData] = useState<RegisterData>({
		Username: '',
		Email: '',
		Password: '',
		FullName: '',
		Address: '',
		DateOfBirth: new Date().toUTCString(),
		Type: UserType.Client,
	} as RegisterData);

	const [localImagePath, setLocalImagePath] = useState<string | File>('');
	const [localImageName, setLocalImageName] = useState<string | undefined>(
		undefined
	);
	const [usedGoogleAuth, setUsedGoogleAuth] = useState(false);

	const [registerFormValid, setRegisterFormValid] = useState({
		Username: true,
		Email: true,
		Password: true,
		FullName: true,
		DateOfBirth: true,
		Address: true,
		Type: true,
		ImagePath: true,
	});

	const isValid = () => {
		return (
			registerFormValid.Username &&
			registerFormValid.Email &&
			registerFormValid.Password &&
			registerFormValid.FullName &&
			registerFormValid.DateOfBirth &&
			registerFormValid.Address &&
			registerFormValid.Type &&
			registerFormValid.ImagePath
		);
	};

	const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			setLocalImageName(e.target.files[0].name);
			setLocalImagePath(e.target.files[0]);
		}
	};

	useEffect(() => {}, [localImagePath]);

	async function onRegister() {
		if (!isValid() || !localImagePath || !localImageName) {
			alert('Please fill out the form');
			return;
		}

		let file;

		if (usedGoogleAuth) {
			const localImagePathString =
				typeof localImagePath === 'string' ? localImagePath : '';
			if (localImagePathString) {
				const fetchedImg = await fetch(localImagePathString);
				const blobImg = await fetchedImg.blob();
				file = new File([blobImg], localImageName);
			}
		} else {
			file = localImagePath instanceof File ? localImagePath : null;
		}

		if (!file) {
			alert('Failed to process the image.');
			return;
		}

		const formData = new FormData();
		formData.append('file', file);
		formData.append('fileName', localImageName);
		const hashedEmail = SHA256(registerFormData.Email).toString();

		const uploadImgRes = await props.blobService.UploadProfileImage(
			formData,
			hashedEmail
		);

		if (!uploadImgRes) {
			alert('Failed uploading image.');
			return;
		}

		let registerDataSend = { ...registerFormData };

		if (usedGoogleAuth) {
			registerDataSend.Password = undefined;
			registerDataSend.ImagePath = uploadImgRes;
		} else {
			registerDataSend.ImagePath = uploadImgRes;
		}

		const res = await props.authService.Register(registerDataSend);

		if (!res) {
			alert('Registration failed, please try different parameters.');
			return;
		}

		alert('Registration successful, please log in.');
		navigate(`../${RoutesNames.Login}`);
	}

	function getFirstPartOfEmail(email: string) {
		if (!email || typeof email !== 'string') {
			throw new Error('Invalid email input');
		}
		const firstPart = email.split('@')[0];
		return firstPart;
	}

	function formatDateForInput(dateString: string) {
		const date = new Date(dateString);
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
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
				height: '100vh',
				justifyContent: 'center',
			}}
			onSubmit={(e) => {
				e.preventDefault();
				onRegister();
			}}
		>
			<Button variant='contained' component='label'>
				Upload Image
				<input
					type='file'
					hidden
					accept='image/*'
					onChange={handleImageChange}
				/>
			</Button>

			{localImagePath && (
				<Box sx={{ textAlign: 'center', mt: 2 }}>
					<img
						width={100}
						src={
							localImagePath instanceof File
								? URL.createObjectURL(localImagePath)
								: localImagePath
						}
						alt='Preview'
					/>
				</Box>
			)}

			<TextField
				label='Full Name'
				variant='outlined'
				error={!registerFormValid.FullName}
				helperText={
					!registerFormValid.FullName
						? 'Full name must be at least 4 characters long'
						: ''
				}
				onChange={(e) => {
					const val = e.target.value;
					setRegisterFormData({ ...registerFormData, FullName: val });
					setRegisterFormValid({
						...registerFormValid,
						FullName: val.length > 3,
					});
				}}
				value={registerFormData.FullName}
				fullWidth
			/>

			<TextField
				label='Date of Birth'
				variant='outlined'
				type='date'
				onChange={(e) => {
					const val = e.target.value;
					setRegisterFormData({
						...registerFormData,
						DateOfBirth: val,
					});
				}}
				value={formatDateForInput(registerFormData.DateOfBirth)}
				fullWidth
			/>

			<TextField
				label='Username'
				variant='outlined'
				error={!registerFormValid.Username}
				helperText={
					!registerFormValid.Username
						? 'Username must be at least 4 characters long'
						: ''
				}
				onChange={(e) => {
					const val = e.target.value;
					setRegisterFormData({ ...registerFormData, Username: val });
					setRegisterFormValid({
						...registerFormValid,
						Username: val.length >= 3,
					});
				}}
				value={registerFormData.Username}
				fullWidth
			/>

			<TextField
				label='Email'
				variant='outlined'
				error={!registerFormValid.Email}
				helperText={
					!registerFormValid.Email ? 'Invalid email format' : ''
				}
				onChange={(e) => {
					const val = e.target.value;
					setRegisterFormData({ ...registerFormData, Email: val });
					setRegisterFormValid({
						...registerFormValid,
						Email: EMAIL_REGEX.test(val),
					});
				}}
				value={registerFormData.Email}
				type='email'
				fullWidth
			/>

			{!usedGoogleAuth && (
				<TextField
					label='Password'
					variant='outlined'
					type='password'
					error={!registerFormValid.Password}
					helperText={
						!registerFormValid.Password
							? 'Password must be at least 8 characters long and include a number and a special character'
							: ''
					}
					onChange={(e) => {
						const val = e.target.value;
						setRegisterFormData({
							...registerFormData,
							Password: val,
						});
						setRegisterFormValid({
							...registerFormValid,
							Password: PASSWORD_REGEX.test(val),
						});
					}}
					value={registerFormData.Password ?? ''}
					fullWidth
				/>
			)}

			<TextField
				label='Address'
				variant='outlined'
				error={!registerFormValid.Address}
				helperText={
					!registerFormValid.Address
						? 'Address must be at least 4 characters long'
						: ''
				}
				onChange={(e) => {
					const val = e.target.value;
					setRegisterFormData({ ...registerFormData, Address: val });
					setRegisterFormValid({
						...registerFormValid,
						Address: val.length > 3,
					});
				}}
				value={registerFormData.Address}
				fullWidth
			/>

			{!usedGoogleAuth && (
				<FormControl component='fieldset'>
					<FormLabel component='legend'>User Type</FormLabel>
					<RadioGroup
						row
						value={registerFormData.Type}
						onChange={(e) => {
							setRegisterFormData({
								...registerFormData,
								Type: e.target.value as unknown as UserType,
							});
						}}
					>
						<FormControlLabel
							value={UserType.Client}
							control={<Radio />}
							label='Client'
						/>
						<FormControlLabel
							value={UserType.Driver}
							control={<Radio />}
							label='Driver'
						/>
					</RadioGroup>
				</FormControl>
			)}

			<GoogleAuth
				googleAuthService={GoogleAuthService}
				setUserInfo={(userInfo) => {
					setRegisterFormData({
						...registerFormData,
						Password: undefined,
						Email: userInfo.email,
						FullName: userInfo.name,
						Username: getFirstPartOfEmail(userInfo.email),
						DateOfBirth: new Date().toISOString(),
						Address: 'Random Address',
						Type: UserType.Client,
					});
					setRegisterFormValid({
						Address: true,
						DateOfBirth: true,
						Email: EMAIL_REGEX.test(userInfo.email),
						FullName: userInfo.name.length > 3,
						ImagePath: true,
						Password: true,
						Username: true,
						Type: true,
					});
					setLocalImagePath(userInfo.picture);
					setLocalImageName('image.png');
					setUsedGoogleAuth(true);
				}}
			/>

			<Typography variant='body2'>
				Already have an account? <Link to='/Login'>Log In</Link>
			</Typography>

			<Button type='submit' variant='contained' color='primary'>
				Register
			</Button>
		</Box>
	);
};
