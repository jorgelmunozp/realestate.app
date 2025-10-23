import Swal from 'sweetalert2';
import './Alert.scss';

export const Alert = Swal.mixin({
  customClass: {
    popup: 'custom-swal-popup',
    confirmButton: 'custom-swal-confirm-btn',
    cancelButton: 'custom-swal-cancel-btn'
  },
  buttonsStyling: false
});
