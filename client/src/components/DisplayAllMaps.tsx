import React, {Component, Fragment} from 'react';
import {Document, Page} from 'react-pdf/dist/entry.webpack';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import {Card, Row, Col, Spin, Divider} from 'antd';
import {getImageFileNames, mapToBase64} from '../dataservice/getMaps';
import DisplayMap from './DisplayPDF';
import {Gutter} from 'antd/lib/grid/row';

const options = {
  cMapUrl: 'cmaps/',
  cMapPacked: true,
};

interface SmallMapProps {
  fileName: string;
}

interface SmallMapState {
  file: string;
  numPages: number;
  loading: boolean;
}

// show pdf like an image
export class SmallMap extends Component<SmallMapProps, SmallMapState> {
  constructor(Props: SmallMapProps) {
    super(Props);
    this.state = {
      file: this.props.fileName,
      numPages: null,
      loading: true,
    };

    // pdf stuff
    this.onFileChange = this.onFileChange.bind(this);
    this.onDocumentLoadSuccess = this.onDocumentLoadSuccess.bind(this);
  }

  componentWillUpdate(nextProps: SmallMapProps) {
    if (this.props.fileName !== nextProps.fileName) {
      this.setState({file: nextProps.fileName});
    }
  }

  // pdf stuff
  onFileChange = event => {
    this.setState({
      file: event.target.files[0],
    });
  };
  onDocumentLoadSuccess = ({numPages}) => {
    this.setState({numPages, loading: false});
  };

  render() {
    const {file, numPages} = this.state;
    return (
      // <Card
      //     style={{width:300}}
      //     bordered={false}

      // >
      <Document
        file={file}
        onLoadSuccess={this.onDocumentLoadSuccess}
        options={options}
        loading={<Spin></Spin>}
      >
        {Array.from(new Array(numPages), (el, index) => (
          <Page
            // height={200}
            width={500}
            // width={800}
            key={`page_${index + 1}`}
            pageNumber={index + 1}
          />
        ))}
      </Document>
      // </Card>
    );
  }
}

interface DisplayAllMapsProps {
  tcsnumber: string;
}

interface DisplayAllMapsState {
  fileNames: {fileName: string; img: string}[];
  showFullScreen: boolean;
  fullScreenFile: string;
  loading: boolean;
}

export default class DisplayAllMaps extends Component<
  DisplayAllMapsProps,
  DisplayAllMapsState
> {
  constructor(Props: DisplayAllMapsProps) {
    super(Props);
    this.state = {
      fileNames: [],
      showFullScreen: false,
      fullScreenFile: '',
      loading: true,
    };
    this.renderMaps = this.renderMaps.bind(this);
  }
  componentDidMount() {
    // getMapFileNames(this.props.tcsnumber).then((files)=>{
    //     this.setState({fileNames: files})
    // })

    getImageFileNames(this.props.tcsnumber).then(files => {
      const imgs = [];

      async function base64() {
        for (let i = 0; i < files.length; i++) {
          const img = await mapToBase64(files[i]);
          imgs.push({fileName: files[i], img});
        }
      }
      base64().then(() => {
        this.setState({fileNames: imgs, loading: false});
      });
    });
  }

  renderMaps() {
    // const onClick = () =>{
    //     this.setState({fullScreenFile: ""}, ()=>{
    //     })
    // }
    const rowProps = {
      gutter: [10, {xs: 8, sm: 16, md: 24, lg: 32}] as Gutter,
    };
    const colSpanProps = {
      xs: {span: 22},
      sm: {span: 10},
      md: {span: 10},
      lg: {span: 22},
      xl: {span: 22},
      xxl: {span: 22},
    };
    return (
      <Fragment>
        <Row {...rowProps} justify="center">
          {this.state.fileNames.map((file, index) => (
            <Col {...colSpanProps}>
              {this.state.fullScreenFile === file.img && (
                <DisplayMap
                  file={file}
                  visible={this.state.showFullScreen}
                  onClick={() => {
                    this.setState({showFullScreen: false});
                  }}
                ></DisplayMap>
              )}
              <Card
                hoverable
                bordered={false}
                loading={this.state.loading}
                cover={
                  <img
                    src={`data:image/jpeg;base64,${file.img}`}
                    alt={''}
                    width="100%"
                  ></img>
                }
                bodyStyle={{padding: '0px'}}
                onClick={() => {
                  this.setState({
                    showFullScreen: !this.state.showFullScreen,
                    fullScreenFile: file.img,
                  });
                }}
              ></Card>
              {/* </Space> */}
            </Col>
          ))}
          {this.state.fileNames.length <= 0 && !this.state.loading && (
            <div>No Maps Found...</div>
          )}
          {this.state.loading && <div>Loading...</div>}
        </Row>
      </Fragment>
    );
  }

  render() {
    // const props = {
    //   dots: true,
    //   infinite: true,
    //   speed: 500,
    //   slidesToShow: 1,
    //   slidesToScroll: 1,
    // };
    return <div>{this.renderMaps()}</div>;
  }
}
