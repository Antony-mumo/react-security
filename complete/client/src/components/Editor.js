import ListErrors from "./ListErrors";
import React from "react";
import agent from "../utils/agent";
import { connect } from "react-redux";
import {
  ADD_TAG,
  EDITOR_PAGE_LOADED,
  REMOVE_TAG,
  ARTICLE_SUBMITTED,
  EDITOR_PAGE_UNLOADED,
  UPDATE_FIELD_EDITOR,
  EDITOR_VALIDATE_ARTICLE
} from "../utils/actionTypes";

const mapStateToProps = state => ({
  ...state.editor
});

const mapDispatchToProps = dispatch => ({
  onAddTag: () => dispatch({ type: ADD_TAG }),
  onLoad: payload => dispatch({ type: EDITOR_PAGE_LOADED, payload }),
  onRemoveTag: tag => dispatch({ type: REMOVE_TAG, tag }),
  onSubmit: payload => dispatch({ type: ARTICLE_SUBMITTED, payload }),
  onUnload: payload => dispatch({ type: EDITOR_PAGE_UNLOADED }),
  onValidate: payload =>
    dispatch({
      type: EDITOR_VALIDATE_ARTICLE,
      error: payload.errors != null,
      payload
    }),
  onUpdateField: (key, value) =>
    dispatch({ type: UPDATE_FIELD_EDITOR, key, value })
});

class Editor extends React.Component {
  constructor() {
    super();

    const updateFieldEvent = key => ev =>
      this.props.onUpdateField(key, ev.target.value);
    this.changeTitle = updateFieldEvent("title");
    this.changeDescription = updateFieldEvent("description");
    this.changeBody = updateFieldEvent("body");
    this.changeTagInput = updateFieldEvent("tagInput");

    this.watchForEnter = ev => {
      if (ev.keyCode === 13) {
        ev.preventDefault();
        this.props.onAddTag();
      }
    };

    this.removeTagHandler = tag => () => {
      this.props.onRemoveTag(tag);
    };

    // title can't be blank
    // title is too short (minimum is 1 character)
    // body can't be blank
    // description can't be blank
    // description is too short (minimum is 1 character)
    this.validate = article => {
      const errors = {};

      if (!article.title || article.title.toString().trim().length === 0) {
        const err = "can't be blank";
        errors.title ? errors.title.push(err) : (errors.title = [err]);
      }

      if (!article.title || article.title.toString().trim().length < 1) {
        const err = "is too short (minimum is 1 character)";
        errors.title ? errors.title.push(err) : (errors.title = [err]);
      }

      if (!article.body || article.body.toString().trim().length === 0) {
        const err = "can't be blank";
        errors.body ? errors.body.push(err) : (errors.body = [err]);
      }

      if (
        !article.description ||
        article.description.toString().trim().length === 0
      ) {
        const err = "can't be blank";
        errors.description
          ? errors.description.push(err)
          : (errors.description = [err]);
      }

      if (
        !article.description ||
        article.description.toString().trim().length < 1
      ) {
        const err = "is too short (minimum is 1 character)";
        errors.description
          ? errors.description.push(err)
          : (errors.description = [err]);
      }

      return errors.title || errors.body || errors.description ? errors : null;
    };

    this.submitForm = ev => {
      ev.preventDefault();
      const article = {
        title: this.props.title,
        description: this.props.description,
        body: this.props.body,
        tagList: this.props.tagList
      };

      const errors = this.validate(article);
      if (errors) {
        this.props.onValidate({ errors });
      } else {
        const slug = { slug: this.props.articleSlug };
        const promise = this.props.articleSlug
          ? agent.Articles.update(Object.assign(article, slug))
          : agent.Articles.create(article);

        this.props.onSubmit(promise);
      }
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.match.params.slug !== nextProps.match.params.slug) {
      if (nextProps.match.params.slug) {
        this.props.onUnload();
        return this.props.onLoad(
          agent.Articles.get(this.props.match.params.slug)
        );
      }
      this.props.onLoad(null);
    }
  }

  componentWillMount() {
    if (this.props.match.params.slug) {
      return this.props.onLoad(
        agent.Articles.get(this.props.match.params.slug)
      );
    }
    this.props.onLoad(null);
  }

  componentWillUnmount() {
    this.props.onUnload();
  }

  render() {
    return (
      <div className="editor-page">
        <div className="container page">
          <div className="row">
            <div className="col-md-10 offset-md-1 col-xs-12">
              <ListErrors errors={this.props.errors}></ListErrors>

              <form>
                <fieldset>
                  <fieldset className="form-group">
                    <input
                      className="form-control form-control-lg"
                      type="text"
                      placeholder="Article Title"
                      id="title"
                      value={this.props.title}
                      onChange={this.changeTitle}
                    />
                  </fieldset>

                  <fieldset className="form-group">
                    <input
                      className="form-control"
                      type="text"
                      id="description"
                      placeholder="What's this article about?"
                      value={this.props.description}
                      onChange={this.changeDescription}
                    />
                  </fieldset>

                  <fieldset className="form-group">
                    <textarea
                      className="form-control"
                      rows="8"
                      id="body"
                      placeholder="Write your article (in markdown)"
                      value={this.props.body}
                      onChange={this.changeBody}
                    ></textarea>
                  </fieldset>

                  <fieldset className="form-group">
                    <input
                      className="form-control"
                      type="text"
                      id="tag"
                      placeholder="Enter tags"
                      value={this.props.tagInput}
                      onChange={this.changeTagInput}
                      onKeyUp={this.watchForEnter}
                    />

                    <div className="tag-list">
                      {(this.props.tagList || []).map(tag => {
                        return (
                          <span className="tag-default tag-pill" key={tag}>
                            <i
                              className="ion-close-round"
                              onClick={this.removeTagHandler(tag)}
                            ></i>
                            {tag}
                          </span>
                        );
                      })}
                    </div>
                  </fieldset>

                  <button
                    className="btn btn-lg pull-xs-right btn-primary"
                    type="button"
                    id="submit"
                    disabled={this.props.inProgress}
                    onClick={this.submitForm}
                  >
                    Publish Article
                  </button>
                </fieldset>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Editor);
