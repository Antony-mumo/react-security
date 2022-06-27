import ArticleActions from './ArticleActions';
import { Link } from 'react-router-dom';
import React from 'react';
import { withBasename } from '../../utils/params';

const ArticleMeta = props => {
  const article = props.article;
  return (
    <div className="article-meta">
      <Link to={withBasename(`/@${article.author.username}`)}>
        <img src={article.author.image} alt={article.author.username} />
      </Link>

      <div className="info">
        <Link to={withBasename(`/@${article.author.username}`)} className="author">
          {article.author.username}
        </Link>
        <span className="date">
          {new Date(article.createdAt).toDateString()}
        </span>
      </div>

      <ArticleActions canModify={props.canModify} article={article} />
    </div>
  );
};

export default ArticleMeta;
