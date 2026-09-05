declare module 'bcrypt' {
	const bcrypt: typeof import('bcryptjs');
	export default bcrypt;
}

declare module 'bcryptjs';
