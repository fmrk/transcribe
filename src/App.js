import React, { Component } from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RaisedButton from 'material-ui/RaisedButton';
import Dialog from 'material-ui/Dialog';
import { lightBlue500 } from 'material-ui/styles/colors';
import FlatButton from 'material-ui/FlatButton';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import DropzoneComponent from 'react-dropzone-component';
import Highlight from 'react-highlight';
import 'react-dropzone-component/styles/filepicker.css';
import 'dropzone/dist/min/dropzone.min.css';
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card';
import { transform } from 'babel-standalone';
import {List, ListItem} from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import Divider from 'material-ui/Divider';
import Checkbox from 'material-ui/Checkbox';
import Toggle from 'material-ui/Toggle';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem'
import MsTranslator from 'mstranslator';

const styles = {
  container: {
    textAlign: 'center',
    paddingTop: 50,
    paddingBottom: 50
  },
  card: {
    marginLeft: 25,
    marginRight: 25,
    marginBottom: 25
  }
};
const muiTheme = getMuiTheme({
  palette: {
    accent1Color: lightBlue500
  }
});

class App extends Component {
  state = {
    singleQuotes: true,
    open: false,
    inputString: null,
    strings: [],
    outputString: null,
    language: 'pl' 
  };

  djsConfig = {
    autoProcessQueue: false
  };

  config = {
    iconFiletypes: ['.js', '.jsx', '.json'],
    showFiletypeIcon: true,
    postUrl: 'no-url'
  };

  languages = [
    {langauge: 'English', iso: 'en'},
    {langauge: 'Polish', iso: 'pl'},
    {langauge: 'Chinese (Simplified)', iso: 'zh-CN'},
    {langauge: 'Italian', iso: 'it'},
    {langauge: 'German', iso: 'ger'}
  ];
  client = new MsTranslator({
    api_key: "1567be2bc6dc44fca98ba01bc222a662"
  }, true);

  getMatches = (s, re) => {
    let m;
    let results = [];
    do {
        m = re.exec(s);
        if (m) {
            results = [...results, {value: m[1], translate: false, translation: null}];
            console.log(m[1]);
        }
    } while (m);
    return results;
    // return str.match(regExp).map(function(el) {
    //     var index = str.indexOf(el);
    //     return [index, index + el.length - 1];
    // });
  }
  translate = (str) => {
    var params = {
      text: str,
      from: 'en',
      to: this.state.language
    };
     
    // Don't worry about access token, it will be auto-generated if needed. 
    this.client.translate(params, function(err, data) {
      console.log(data);
    });
  }
  handleTranslate = () => {
    const transcribe = this;
    const translatedStrings = this.state.strings.map((element, i) => {
      return element.translate ?
      {...element, translation: transcribe.translate(element.value) } :
      element;
    });
    this.setState({strings: translatedStrings});
  }

  handleCheckboxChange = (e) => {
    const str = e.target.value;
    const updatedStrings = this.state.strings.map((element, i) => {
      return element.value === str ?
      {...element, translate: !element.translate } :
      element;
    });
    this.setState({strings: updatedStrings});

  }

  

  handleGetStrings = () => {
    const sourceCode = this.state.inputString.content;
    const regExp = /'((?:\\.|[^'\\])*)'/g;
    
    const strings = this.getMatches(sourceCode, regExp);
    this.setState({strings: strings});
    // const replacement = 'localizedStringArray.string';
    // let i = 0;
    // const result = sourceCode.replace(
    //   new RegExp(regExp, 'g'),
    //   `${replacement}${i++}`
    // );
    console.log(strings);
  };

  eventHandlers = {
    addedfile: file => this.handleFile(file, this)
  };

  handleRequestClose = () => {
    this.setState({
      open: false
    });
  };

  handleTouchTap = () => {
    this.setState({
      open: true
    });
  };

  handleFile = (file, transcribe) => {
    let fileRead = file,
      read = new FileReader();

    read.readAsBinaryString(fileRead);

    read.onloadend = function() {
      transcribe.setState({
        inputString: { content: read.result, name: file.name, type: file.type }
      });
      console.log(read.result);
    };
  };
  renderList = () => {
    const list = this.state.strings.map((element, i) => {
      return <ListItem key={`li-${i}`} primaryText={element.translation ? element.value +' ➡️ '+element.translation : element.value} leftCheckbox={<Checkbox checked={element.translate} value={element.value} onClick={this.handleCheckboxChange}/>} />
  });
  return list;
  }

  renderLanguages = () => {
    const items = this.languages.map((element, i) => {
      return (<MenuItem value={element.iso} key={element.iso+'-'+i} primaryText={element.langauge} />);
    });  
    return items;
  }

  handleLanguageChange = (event, index, value) => {
    this.setState({language: value});
  };

  render = () => {
    const standardActions = (
      <FlatButton
        label="Ok"
        primary={true}
        onTouchTap={this.handleRequestClose}
      />
    );
    const { inputString, open, strings } = this.state;

    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <div>
          <div style={styles.container}>
            <Dialog
              open={open && !inputString}
              title="Upload your file"
              actions={standardActions}
              onRequestClose={this.handleRequestClose}
            >
              <DropzoneComponent
                config={this.config}
                eventHandlers={this.eventHandlers}
                djsConfig={this.djsConfig}
              />
            </Dialog>
            <h1>✍️ TRANSCRIBE 🌏</h1>
            <h2>translate your script</h2>
            {!inputString &&
              <RaisedButton
                label="Upload your file"
                secondary={true}
                onTouchTap={this.handleTouchTap}
              />}
          </div>
          {inputString &&
            <Card style={styles.card}>
              <CardHeader
                title={inputString.name}
                subtitle={inputString.type}
                actAsExpander={true}
                showExpandableButton={true}
              />
              {!strings.length && 
              <CardActions>
                <FlatButton
                  label="Get Strings"
                  onTouchTap={this.handleGetStrings}
                />
              </CardActions>}
              
              <CardText expandable={true}>
                <Highlight className="javascript">
                  {inputString.content}
                </Highlight>
              </CardText>
            </Card>}
            {!!strings.length &&
              <Card style={styles.card}>
                <CardHeader
                  title='strings to translate'
                  subtitle={'found: '+strings.length}
                  actAsExpander={true}
                  showExpandableButton={true}
                />
                <CardActions>
                  <FlatButton label="Translate" 
                  onTouchTap={this.handleTranslate}/>
                </CardActions>
                <CardText expandable={true}>
                  <SelectField
                    value={this.state.language}
                    onChange={this.handleLanguageChange}
                    maxHeight={300}
                  >
                    {this.renderLanguages()}
                  </SelectField>
                <List>
                  <Subheader>Pick strings to translate</Subheader>
                  {this.renderList()}
                  
                </List>
                </CardText>
              </Card>}
        </div>
      </MuiThemeProvider>
    );
  };
}

export default App;
