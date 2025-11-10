import React from 'react';
import './HeaderSimples.css';

function HeaderSimples() {
  return React.createElement('div', { className: 'header-simples-container' }, [
    React.createElement('img', {
      key: 'logo',
      src: require('../assets/imagens/logosenai.png'),
      alt: 'Logo SENAI',
      className: 'logo-simples'
    }),
    React.createElement('div', {
      key: 'linha',
      className: 'linha-simples'
    })
  ]);
}

export default HeaderSimples;
