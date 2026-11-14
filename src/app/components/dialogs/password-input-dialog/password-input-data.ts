export class PasswordInputData {
    constructor(
        public titleText: string,
        public inputText: string = '',
        public placeholderText: string,
        public confirmationPlaceholderText: string = '',
        public confirmationErrorText: string = '',
        public requiresConfirmation: boolean = false,
    ) {}
}