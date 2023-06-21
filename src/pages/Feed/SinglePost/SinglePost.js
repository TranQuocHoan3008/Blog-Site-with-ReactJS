import React, { Component } from "react";

import Image from "../../../components/Image/Image";
import "./SinglePost.css";

class SinglePost extends Component {
  state = {
    title: "",
    author: "",
    date: "",
    image: "",
    content: "",
  };

  async componentDidMount() {
    const postId = this.props.match.params.postId;
    const res = await fetch("http://localhost:8080/feed/post/" + postId);
    if (res.status !== 200) {
      throw new Error("Failed to fetch status");
    }
    const resData = await res.json();
    console.log(resData);
    this.setState({
      title: resData.post.title,
      author: resData.post.creator.name,
      date: new Date(resData.post.createdAt).toLocaleDateString("en-US"),
      content: resData.post.content,
      image:
        "http://localhost:8080/" + resData.post.imageUrl.replace("\\", "/"),
    });
  }

  render() {
    return (
      <section className="single-post">
        <h1>{this.state.title}</h1>
        <h2>
          Created by {this.state.author} on {this.state.date}
        </h2>
        <div className="single-post__image">
          <Image contain imageUrl={this.state.image} />
        </div>
        <p>{this.state.content}</p>
      </section>
    );
  }
}

export default SinglePost;