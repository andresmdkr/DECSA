import styles from './UnderConstruction.module.css';
import constructionImage from '../../assets/under_construction.png'; // Asegúrate de que la ruta a la imagen sea correcta


const UnderConstruction = () => {

    return (
        <div className={styles.underConstruction}>
            <div className={styles.constructionContainer}>
            <h1>Pagina en construccion</h1>
                <img
                    src={constructionImage}
                    alt="Page Under Construction"
                    className={styles.constructionImage}
                />
              
            </div>
        </div>
    );
};

export default UnderConstruction;
