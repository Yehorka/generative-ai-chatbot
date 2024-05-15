import React from 'react';

const Modal = ({ isOpen, onClose, onSubmit }) => {
    const [inputValue, setInputValue] = React.useState("");


    const handleChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleSubmit = () => {
        onSubmit(inputValue);
        setInputValue("");
    }
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2>Введіть назву чату</h2>
                <input type="text" value={inputValue} onChange={handleChange} onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (inputValue) {
              handleSubmit();
            }
          }          
        }} />
                <button onClick={handleSubmit}>Створити</button>
                <div onClick={onClose}><i class="fa-solid fa-circle-xmark"></i></div>
            </div>
        </div>
    );
};

export default Modal;