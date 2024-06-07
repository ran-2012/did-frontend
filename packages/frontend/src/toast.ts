import {toast as reactToast, ToastOptions, Slide} from 'react-toastify';

const configTemplate: ToastOptions = {
    position: "bottom-right",
    autoClose: 2000,
    transition: Slide,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
}

function success(msg: string) {
    reactToast.success(msg, configTemplate);
}

function info(msg: string) {
    reactToast.info(msg, configTemplate);
}

function warn(msg: string) {
    reactToast.warn(msg, configTemplate)
}

function error(msg: string) {
    reactToast.error(msg, configTemplate)
}

const toast = (msg: string) => info(msg)
toast['success'] = success;
toast['info'] = info;
toast['warn'] = warn;
toast['error'] = error;

export default toast;