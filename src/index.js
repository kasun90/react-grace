import React, { Component } from 'react';
import './index.css';
import * as PropTypes from "prop-types";

class Grace extends Component {
    render() {

        if (!this.props.document) {
            return null;
        }

        const tags = Array.from(this.props.document.children);
        const renderedTags = [];

        for (let i = 0; i < tags.length; i++) {
            renderedTags.push(this.deriveTag(tags[i], i))
        }

        const classGrace = this.props.className ? this.props.className : 'grace-general';

        return(<div className={classGrace}>
            {renderedTags}
            </div>)
    }

    deriveTag(tag, index) {
        switch (tag.type) {
            case 'PARAGRAPH':
                return this.deriveParagraph(tag, index);
            case 'HEADER':
                return this.deriveHeader(tag, index);
            case 'NOTE':
                return this.deriveNote(tag, index);
            case 'IMAGE':
                return this.deriveImage(tag, index);
            case 'UNORDERED_LIST':
                return this.deriveUnorderedList(tag, index);
            case 'ORDERED_LIST':
                return this.deriveOrderedList(tag, index);
            case 'CODE':
                return this.deriveCode(tag, index);
            case 'TERMINAL':
                return this.deriveTerminal(tag, index);
            case 'GIST':
                return this.deriveGist(tag, index);
            default:
                return null;
        }
    }

    deriveParagraph(tag, index) {
        return <p key={index}>{this.deriveRichText(tag)}</p>
    }

    deriveRichText(tag) {
        const _children = Array.from(tag.children);
        var i = 0;
        var content = [];
        _children.forEach((subTag) => {
            switch (subTag.type) {
                case 'TEXT':
                    content.push(subTag.data.value);
                    break;
                case 'STRONG_TEXT':
                    content.push(<strong>{subTag.data.value}</strong>);
                    break;
                case 'ITALIC_TEXT':
                    content.push(<i>{subTag.data.value}</i>);
                    break;
                case 'LINK':
                    content.push(<a href={subTag.data.url}>{subTag.data.value}</a>)
                    break;
                default:
                    break;
            }
            i++;
        });
        return content;
    }

    deriveHeader(tag, index) {
        const GraceHeader = `h${tag.data.size}`;
        return <GraceHeader key={index}>{tag.data.value}</GraceHeader>;
    }

    deriveNote(tag, index) {
        return <section><p key={index}>{this.deriveRichText(tag)}</p></section>;
    }

    deriveImage(tag, index) {
        return <img src={tag.data.resource} alt={tag.data.caption}/>;
    }

    deriveUnorderedList(tag, index) {
        const _children = Array.from(tag.children);
        const content = [];
        let i = 0;
        _children.forEach((subTag) => {
            content.push(<li key={i}>{this.deriveRichText(subTag)}</li>);
            i++;
        });
        return <ul key={index}>{content}</ul>;
    }

    deriveOrderedList(tag, index) {
        const _children = Array.from(tag.children);
        var content = [];
        var i = 0;
        _children.forEach((subTag) => {
            content.push(<li key={i}>{this.deriveRichText(subTag)}</li>);
            i++;
        });
        return <ol key={index}>{content}</ol>;
    }

    deriveCode(tag, index) {
        const _children = Array.from(tag.children);
        var content = [];
        var i = 0;
        _children.forEach((subTag) => {
            content.push(subTag.data.value);
            content.push(<br key={i++}/>);
        });
        return <div key={index}><pre className="grace-code">{content}</pre></div>
    }

    deriveTerminal(tag, index) {
        const _children = Array.from(tag.children);
        var content = [];
        var i = 0;
        const prompt = tag.data.prompt ? tag.data.prompt : '$';
        _children.forEach((subTag) => {
            content.push(<li key={i++} prefix={prompt}>{subTag.data.value}</li>);
        });
        return <div key={index}>
            <pre className="grace-code">
            <ul className="grace-code-list">{content}</ul>
            </pre>
            </div>;
    }

    deriveGist(tag, index) {
        return <GraceGist key={index} gist={tag.data.source} file={tag.data.file}/>
    }
}

export default Grace;

class GraceGist extends Component {

    constructor(props) {
        super(props);
        this.gist = props.gist;
        this.file = props.file;
        this.stylesheetAdded = false;
        this.state = {
            src: ""
        };
        this.gistSrcSet = this.gistSrcSet.bind(this);
    }

    addStylesheet(href) {
        if (!this.stylesheetAdded) {
            const link = document.createElement('link');
            link.type = "text/css";
            link.rel = "stylesheet";
            link.href = href;
            document.head.appendChild(link);
            this.stylesheetAdded = true;
        }
    };

    gistSrcSet(gist) {
        this.setState({
            src: gist.div
        });
        this.addStylesheet(gist.stylesheet);
    }

    componentDidMount() {
        const gistCallback = GraceGist.nextGistCallback();
        window[gistCallback] = this.gistSrcSet;

        let url = "https://gist.github.com/" + this.props.gist + ".json?callback=" + gistCallback;

        if (this.props.file) {
            url += "&file=" + this.props.file;
        }

        let script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;
        document.head.appendChild(script);
    }

    render() {
        return (<div>
            <div dangerouslySetInnerHTML={{__html: this.state.src}}/>
        </div>);
    }
}

GraceGist.propTypes = {
    gist: PropTypes.string.isRequired, // e.g. "username/id"
    file: PropTypes.string // to embed a single specific file from the gist
};

let gistCallbackID = 0;

GraceGist.nextGistCallback = () => {
    return "embed_gist_callback_" + gistCallbackID++;
};
