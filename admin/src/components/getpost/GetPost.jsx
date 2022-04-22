import React, { Component } from 'react';
import axios from 'axios';
import './getpost.css'

export default class GetPost extends Component {
    
    postObj = {
        _id: '',
        caption: '',
        report:''
    }

    state = {
        modalIsOpen: false,
        secondModalIsOpen: false
      };
    
      openModal = (data) => {
        this.setState({ 
            modalIsOpen: true 
        });

        this.setPostVal(data);
      };

      setPostVal = (data) => {
         this.postObj = {
            _id: data._id,
            caption: data.caption,
            report: data.report
        }
      }
    
      closeModal = () => {
        this.setState({ modalIsOpen: false });
      };
    
      openSecondModal = () => {
        this.setState({ secondModalIsOpen: true });
      };
    
      closeSecondModal = () => {
        this.setState({ secondModalIsOpen: false });
      };
      
      

    constructor(props) {
        super(props)

        this.state = {
            posts: []
        };

        this.deletePost = this.deletePost.bind(this);
    }

    componentDidMount() {
      this.getPosts();
    }

    getPosts() {
        const headers = { 'Content-Type': 'application/json' }

        const endpoint = 'http://localhost:8800/api';

        axios.get(endpoint, { headers })
        .then(response => {
            this.setState({
                posts: response.data
            });
        })
        .catch((error) => {
            console.log(error);
        })        
    }

    deletePost(id) {
        axios.delete('http://localhost:8800/api/delete/' + id)
            .then((res) => {
                alert('Post blocked!')
                this.getPosts();
            }).catch((error) => {
                console.log(error)
           })
    }

    


    
    refreshPage() {
        window.location.reload(false);
    }


   


    render() {
        const { posts } = this.state;
        return (
            <>
                <ul className="list-group">

                <li class="list-group-item active" aria-current="true">All posts</li>

                    {posts.map((data) => (
                    
                        <li key={data._id} className="list-group-item d-flex justify-content-between align-items-start">
                            
                            <div className="ms-2 me-auto">
                               <div className="fw-bold">{data.caption}</div>
                              

                            </div>
                            <div className="hi">
                            <span class="badge rounded-pill bg-danger"><div className="fw-bold">{data.report.length}</div></span>
                                </div>
                            &nbsp;
                            <button className="badge bg-danger rounded-pill" onClick={this.deletePost.bind(this, data._id)}>Block</button>
                        </li>
                    ))}
                </ul>

                      
            </>    
        )
    }

}