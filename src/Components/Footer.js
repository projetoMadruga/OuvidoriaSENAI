import React from 'react';
import './Footer.css';

function Footer() {
    return (
        <footer className="footer">
            <div className="redes-sociais">
                <a href="https://www.facebook.com/senai.suico/?locale=pt_BR" className="icon-circle">
                    <img src={require('../assets/imagens/facebook.png')} alt="Facebook" />
                </a>
                <a href="https://x.com/senaisuico" className="icon-circle">
                    <img src={require('../assets/imagens/x.png')} alt="X" />
                </a>
                <a href="https://www.youtube.com/@SenaiSuico-BrasileiraPauloETol" className="icon-circle">
                    <img src={require('../assets/imagens/yt.png')} alt="YouTube" />
                </a>
                <a href="https://br.linkedin.com/school/senaisp-suico/" className="icon-circle">
                    <img src={require('../assets/imagens/linkedin.png')} alt="LinkedIn" />
                </a>
                <a href="https://www.instagram.com/senai.suico/" className="icon-circle">
                    <img src={require('../assets/imagens/instagram.png')} alt="Instagram" />
                </a>
                <a href="https://wa.me/551156423407" className="icon-circle" target="_blank" rel="noopener noreferrer">
                    <img src={require('../assets/imagens/whatsappp.png')} alt="WhatsApp" />
                </a>
            </div>
            <div className="footer-info">
                <div className="info-bloco">
                    <h4>EDIFÍCIO SEDE FIESP</h4>
                    <p>Av. Paulista, 1313, São Paulo/SP</p>
                    <p>CEP 01311-923</p>
                </div>
                <div className="info-bloco">
                    <h4>SENAI Santo Amaro - Suíço-Brasileira</h4>
                    <p>Rua Bento Branco de Andrade Filho, 379 - Santo Amaro</p>
                    <p>São Paulo - SP - CEP: 04757-000</p>
                    <p>Telefone: (11) 5642-3400</p>
                    <p>WhatsApp: (11) 5642-3407</p>
                </div>
                <div className="info-bloco">
                    <h4>CENTRAL DE RELACIONAMENTO</h4>
                    <p>(11) 3322-0050 (Telefone/WhatsApp)</p>
                    <p>0800-055-1000 (Interior de SP, somente telefone fixo)</p>
                </div>
            </div>
            <div className="footer-links">
                <a href="https://www.sp.senai.br/unidades">Unidades</a>
                <a href="https://www.sp.senai.br/">O SENAI</a>
                <a href="https://transparencia.sp.senai.br/sac">Fale Conosco</a>
                <a href="https://transparencia.sp.senai.br/">Transparência</a>
            </div>
            <p className="footer-copy">Copyright 2025 © Todos os direitos reservados.</p>
        </footer>
    );
}

export default Footer;