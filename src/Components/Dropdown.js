import React, { useState } from 'react';
import './Dropdown.css';

function Dropdown({ titulo, children }) {
    const [aberto, setAberto] = useState(false);

    const toggleDropdown = () => {
        setAberto(!aberto);
    };

    return (
        <div className="dropdown" onClick={toggleDropdown}>
            <div 
                className="dropdown-titulo"
            >
                {titulo} ▾
            </div>
            {aberto && (
                <div className="dropdown-conteudo">
                    {children}
                </div>
            )}
        </div>
    );
}

export default Dropdown;