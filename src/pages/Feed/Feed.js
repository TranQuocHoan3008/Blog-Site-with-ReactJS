import React, { Component, Fragment } from "react";

import Post from "../../components/Feed/Post/Post";
import Button from "../../components/Button/Button";
import FeedEdit from "../../components/Feed/FeedEdit/FeedEdit";
import Input from "../../components/Form/Input/Input";
import Paginator from "../../components/Paginator/Paginator";
import Loader from "../../components/Loader/Loader";
import ErrorHandler from "../../components/ErrorHandler/ErrorHandler";
import "./Feed.css";

class Feed extends Component {
  state = {
    isEditing: false,
    posts: [],
    totalPosts: 0,
    editPost: null,
    status: "",
    postPage: 1,
    postsLoading: true,
    editLoading: false,
  };

  async componentDidMount() {
    try {
      const res = await fetch("URL");

      if (res.status !== 200) {
        throw new Error("Failed to fetch user status.");
      }
      const resData = await res.json();

      this.setState({ status: resData.status });
    } catch (error) {
      this.loadPosts();
    }
  }

  loadPosts = async (direction) => {
    try {
      if (direction) {
        this.setState({ postsLoading: true, posts: [] });
      }
      let page = this.state.postPage;
      if (direction === "next") {
        page++;
        this.setState({ postPage: page });
      }
      if (direction === "previous") {
        page--;
        this.setState({ postPage: page });
      }
      const res = await fetch("http://localhost:8080/feed/posts?page=" + page, {
        headers: {
          Authorization: "Bearer " + this.props.token,
        },
      });

      if (res.status !== 200) {
        throw new Error("Failed to fetch posts.");
      }
      const resData = await res.json();
      console.log(resData);
      this.setState({
        posts: resData.posts,
        totalPosts: resData.totalPosts,
        postsLoading: false,
      });
    } catch (error) {
      console.log(error);
      throw this.catchError;
    }
  };

  statusUpdateHandler = (event) => {
    event.preventDefault();
    fetch("URL")
      .then((res) => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("Can't update status!");
        }
        return res.json();
      })
      .then((resData) => {})
      .catch(this.catchError);
  };

  newPostHandler = () => {
    this.setState({ isEditing: true });
  };

  startEditPostHandler = (postId) => {
    this.setState((prevState) => {
      const loadedPost = { ...prevState.posts.find((p) => p._id === postId) };

      return {
        isEditing: true,
        editPost: loadedPost,
      };
    });
  };

  cancelEditHandler = () => {
    this.setState({ isEditing: false, editPost: null });
  };

  finishEditHandler = async (postData) => {
    try {
      this.setState({
        editLoading: true,
      });

      const formData = new FormData();
      const creator = "6493f1b9527fc9400acbad80";
      formData.append("title", postData.title);
      formData.append("content", postData.content);
      formData.append("image", postData.image);
      formData.append("creator", creator);
      // Set up data (with image!)
      let url = "http://localhost:8080/feed/post";
      let method = "POST";
      console.log(this.state.editPost._id);
      if (this.state.editPost) {
        url =
          "http://localhost:8080/feed/post/edit-post/" +
          this.state.editPost._id;
        method = "PUT";
      }
      const res = await fetch(url, {
        method: method,
        body: formData,
        headers: {
          Authorization: "Bearer " + this.props.token,
        },
      });
      if (res.status !== 200 && res.status !== 201) {
        throw new Error("Creating or editing a post failed!");
      }

      const resData = await res.json();

      resData.post.imageUrl = resData.post.imageUrl.replaceAll("//", "/");

      const post = {
        _id: resData.post._id,
        title: resData.post.title,
        content: resData.post.content,
        creator: resData.post.creator,
        createdAt: resData.post.createdAt,
      };

      this.setState((prevState) => {
        let updatedPosts = [...prevState.posts];
        if (prevState.editPost) {
          const postIndex = prevState.posts.findIndex(
            (p) => p._id === prevState.editPost._id
          );
          updatedPosts[postIndex] = post;
        } else if (prevState.posts.length < 2) {
          updatedPosts = prevState.posts.concat(post);
        }
        return {
          posts: updatedPosts,
          isEditing: false,
          editPost: null,
          editLoading: false,
        };
      });
    } catch (error) {
      this.setState({
        isEditing: false,
        editPost: null,
        editLoading: false,
        error: error,
      });
    }
  };

  statusInputChangeHandler = (input, value) => {
    this.setState({ status: value });
  };

  deletePostHandler = async (postId) => {
    try {
      this.setState({ postsLoading: true });
      const res = await fetch(
        "http://localhost:8080/feed/post/delete-post/" + postId,
        {
          method: "DELETE",
          headers: {
            Authorization: "Bearer " + this.props.token,
          },
        }
      );
      if (res.status !== 200 && res.status !== 201) {
        throw new Error("Deleting a post failed!");
      }
      const resData = await res.json();
      this.setState((prevState) => {
        const updatedPosts = prevState.posts.filter((p) => p._id !== postId);
        return { posts: updatedPosts, postsLoading: false };
      });
    } catch (error) {
      console.log(error);
      this.setState({ postsLoading: false });
    }
  };

  errorHandler = () => {
    this.setState({ error: null });
  };

  catchError = (error) => {
    this.setState({ error: error });
  };

  render() {
    return (
      <Fragment>
        <ErrorHandler error={this.state.error} onHandle={this.errorHandler} />
        <FeedEdit
          editing={this.state.isEditing}
          selectedPost={this.state.editPost}
          loading={this.state.editLoading}
          onCancelEdit={this.cancelEditHandler}
          onFinishEdit={this.finishEditHandler}
        />
        <section className="feed__status">
          <form onSubmit={this.statusUpdateHandler}>
            <Input
              type="text"
              placeholder="Your status"
              control="input"
              onChange={this.statusInputChangeHandler}
              value={this.state.status}
            />
            <Button mode="flat" type="submit">
              Update
            </Button>
          </form>
        </section>
        <section className="feed__control">
          <Button mode="raised" design="accent" onClick={this.newPostHandler}>
            New Post
          </Button>
        </section>
        <section className="feed">
          {this.state.postsLoading && (
            <div style={{ textAlign: "center", marginTop: "2rem" }}>
              <Loader />
            </div>
          )}
          {this.state.posts.length <= 0 && !this.state.postsLoading ? (
            <p style={{ textAlign: "center" }}>No posts found.</p>
          ) : null}
          {!this.state.postsLoading && (
            <Paginator
              onPrevious={this.loadPosts.bind(this, "previous")}
              onNext={this.loadPosts.bind(this, "next")}
              lastPage={Math.ceil(this.state.totalPosts / 2)}
              currentPage={this.state.postPage}
            >
              {this.state.posts.map((post) => (
                <Post
                  key={post._id || ""}
                  id={post._id}
                  author={post.creator.name}
                  date={new Date(post.createdAt).toLocaleDateString("en-US")}
                  title={post.title}
                  image={post.imageUrl}
                  content={post.content}
                  onStartEdit={this.startEditPostHandler.bind(this, post._id)}
                  onDelete={this.deletePostHandler.bind(this, post._id)}
                />
              ))}
            </Paginator>
          )}
        </section>
      </Fragment>
    );
  }
}

export default Feed;
