import logo from './logo.svg';
import './App.css';
import { useState } from 'react';

function Header(props) {
  console.log('props',props.title)
  return (
  <header>
  <h1><a href="/" onClick={(event) => {
    event.preventDefault();
    props.onChangeMode();
  }}>{props.title}</a></h1>
</header>
  )
}

function Nav(props) {
  // if (Object.keys(props).length === 0) {
  //   return <div>프롭스가 비었어요</div>;
  // }
  const lis = [];
  for (let i = 0; i < props.topics.length; i++) {
    let t = props.topics[i];
    lis.push(<li key={t.id}>
      <a id={t.id} href={'/read/' + t.id} onClick={event => {
        event.preventDefault();
        props.onChangeMode(Number(event.target.id));
      }}>{t.title}</a></li>); // key 속성 없이 li 요소 추가
  }

  return (
    <nav>
      <ol>
        {lis}
      </ol>
    </nav>
  );
}


function Article(props) {
  return (
    <article>
        <h2>{props.title}</h2>
        {props.body}

        
      </article>

  )
}

function App() {

  const [mode, setMode] = useState('WELCOME');
  const [id, setId] = useState(null);

  const topics = [
    {id:1, title: 'html', body: 'html is ...'},
    {id:2, title: 'css', body: 'css is ...'},
    {id:3, title: 'javascript', body: 'javascript is ...'},
]
  let content = null;
  if(mode === 'WELCOME') {
     content = <Article title="Welcomee" body = "Hello0, Webb"></Article>
  
    } else if(mode === 'READ') {
    let title, body = null;
    for(let i=0; i<topics.length; i++) {
      console.log(topics[i].id, id);
      if(topics[i].id === id) {
        title = topics[i].title;
        body = topics[i].body;
      }
    }

    content = <Article title={title} body = {body}></Article>
  }


  return (
    <div>
      <Header title="WEB" onChangeMode={()=> {
         setMode('WELCOME');
      }}></Header>
   
      <Nav topics={topics} onChangeMode = {(_id) => {
        setMode('READ');
        setId(_id);

      }}></Nav>
     {content}
    </div>
  );
}

export default App2;
