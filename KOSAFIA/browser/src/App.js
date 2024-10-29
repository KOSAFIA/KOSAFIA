import logo from './logo.svg';
import './App.css';

function App() {

  const handleClick = async () => {
    try {
      const response = await fetch('/api/returnwelcome', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        // 성공시 루트 페이지(웰컴 페이지)로 리다이렉트
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <a
          className="App-link"
          href=""
          target="_blank"
          onClick={(event)=> {
            event.preventDefault();
            handleClick();
          }}
        >
          제이에스피로 돌아가
        </a>
      </header>
    </div>
  );
}

export default App;
