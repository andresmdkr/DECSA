import styles from './Home.module.css';
import constructionImage from '../../assets/under_construction.png'; 
import { useSelector } from 'react-redux';
import UnderConstruction from '../UnderConstruction/UnderConstruction';

const Home = () => {

    return (
        <div className={styles.home}>
            <UnderConstruction />
        </div>
    );
};

export default Home;
