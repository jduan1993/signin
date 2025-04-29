"use strict";
const { Table, Tag, Space, Button, Select, Modal, Radio, Divider, Input, Alert } = antd;
const { Option } = Select;

const CurrentTime = () => {
    const useState = React.useState;
    const [ state, setState ] = useState(new Date().toString());
    const time = () => {
        return setState(new Date().toString());
    }
    setInterval(time, 1000);
    return React.createElement("div", null, "Current Time: " + state);
}

const User = () => {
    const user = sessionStorage.getItem('user')
    let validTime = 0;
    $.ajax({
        url: 'data/user.json',
        dataType: 'json',
        async: false,
        cache: false,
        success : function(data) {
            for (let i = 0; i < data.length; i++) {
                if (data[i]['name'] === user) {
                    validTime = data[i]['expire'];
                }
            }
        }
    });
    return React.createElement(Space, {size: "middle"},
        React.createElement("div", null, "Welcome, " + user),
        React.createElement("div", null, "Your Validity: "
        + parseInt((validTime / 10000).toString())
        + "-" + parseInt((validTime % 10000 / 100).toString())
        + "-" + parseInt((validTime % 100).toString())));
}

let delKeys = [];
const rowSelection = {
    onChange: (selectedRowKeys) => {
        delKeys = selectedRowKeys;
    }
};
const MainTable = (data) => {
    data['length'] = Object.keys(data).length;
    let dataArray = Array.from(data);
    return (React.createElement("div", null,
        React.createElement(Divider, null),
        React.createElement(Table, { rowSelection: Object.assign({ type: "checkbox" }, rowSelection),
            columns: columns, dataSource: dataArray })));
};

const RecordModalButton = (data) => {
    const useState = React.useState;
    const [isModalVisible, setIsModalVisible] = useState(false);
    const showModal = () => {
        $.ajax({
            url: 'data/chen/record.json',
            dataType: 'json',
            cache: false,
            success: function (jsonData) {
                let dataSource = [];
                for (let i = 0; i < jsonData.length; i++) {
                    if (data.text === jsonData[i].name) {
                        jsonData[i].time = new Date(parseInt(jsonData[i].time)).toString();
                        dataSource.push(jsonData[i]);
                    }
                }
                ReactDOM.render(React.createElement(Table, {columns: recordColumns, dataSource: dataSource}),
                    document.getElementById('recordTable' + data.id));
            },
        });
        setIsModalVisible(true);
    };
    const handleCancel = () => {
        setIsModalVisible(false);
    };
    const recordColumns = [
        {
            title: "Subject",
            dataIndex: "subject",
            key: "subject"
        },
        {
            title: "SignIn Record",
            dataIndex: "time",
            key: "time"
        }
    ];
    return (React.createElement(React.Fragment, null,
        React.createElement('a', { onClick: showModal }, data.text),
        React.createElement(Modal, {
                title: 'Records for ' + data.text , visible: isModalVisible, width: 524,
                onCancel: handleCancel, footer: null
            },
            React.createElement('div', { id: 'recordTable' + data.id })
        )));
}

const columns = [
    {
        title: "Name",
        dataIndex: "name",
        key: "name",
        sorter: (a, b) => {
                if(a.name.toLowerCase() > b.name.toLowerCase()) {
                    return 1;
                } else {
                    return -1;
                }
            },
        sortDirections: ['ascend', 'descend'],
        render: (text, record) => {
            return React.createElement(RecordModalButton, { text: text, id: record.key});
        }
    },
    {
        title: "Subject",
        key: "subject",
        dataIndex: "subject",
        render: (subject) => (React.createElement(React.Fragment, null, subject.map((sub) => {
            let color;
            if (sub === "English 1") {
                color = "red";
            } else if (sub === "English 2") {
                color = "orange";
            } else if (sub === "English 3") {
                color = "yellow";
            } else if (sub === "English 4") {
                color = "green";
            } else if (sub === "English 5") {
                color = "cyan";
            } else if (sub === "English 6") {
                color = "blue";
            } else if (sub === "English 7") {
                color = "purple";
            } else if (sub === "English 8") {
                color = "magenta";
            } else if (sub === "Olympic Math 1") {
                color = "red";
            } else if (sub === "Olympic Math 2") {
                color = "orange";
            } else {
                color = "gray";
            }
            return (React.createElement(Tag, { color: color, key: sub }, sub));
        })))
    },
    {
        title: "Remaining Lessons",
        dataIndex: "remaining",
        key: "remaining lessons",
        sorter: (a, b) => a.remaining - b.remaining,
        sortDirections: ['ascend', 'descend'],
        render: (text) => {
            if(parseInt(text) < 6)
            {
                return React.createElement(Alert, { type: "error", message: text });
            } else {
                return text;
            }}
    },
    {
        title: "Used Lessons",
        dataIndex: "used",
        key: "used lessons"
    },
    {
        title: "Total Lessons",
        dataIndex: "total",
        key: "total lessons"
    },
    {
        title: "Action",
        key: "action",
        render: (text, record) => (React.createElement(Space, { size: "middle" },
            React.createElement(signInButton, { num: record.key, name: record.name, subject: record.subject }),
            React.createElement(ModalButton, { act: "modify", num: record.key, name: record.name,
                remaining: record.remaining, subject: record.subject, total: record.total, used: record.used })))
    },
];

const signInButton = (data) => {
    const signIn = () => {
        $.post({
            url: 'php/signInStudent.php',
            data: {
                num: data.num,
                name: data.name,
                subject: data.subject
            },
            cache: false,
            success: function () {
                $.ajax({
                    url: 'data/chen/student.json',
                    dataType: 'json',
                    cache: false,
                    success: function (jsonData) {
                        ReactDOM.render(React.createElement(MainTable, jsonData),
                            document.getElementById('mainTable'));
                        alert(data.name + ' 签到成功！');
                    }
                });
            }
        });
    };
    return React.createElement(Button, { type: "primary", onClick: signIn }, "Sign In");
};

const ModalButton = (data) => {
    const useState = React.useState;
    const [isModalVisible, setIsModalVisible] = useState(false);
    const showModal = () => {
        setIsModalVisible(true);
    };
    let subject = '';
    const handleOk = () => {
        if (data.act === 'add') {
            if(!$('#newStudentName').val()) {
                alert('Name is required!');
            } else {
                $.post({
                    url: 'php/addStudent.php',
                    data: {
                        name: $('#newStudentName').val(),
                        subject: subject,
                        lesson: $('#newStudentTotalLessons').val()
                    },
                    cache: false,
                    success: function () {
                        $.getJSON('data/chen/student.json', function (data) {
                            ReactDOM.render(React.createElement(MainTable, data),
                                document.getElementById('mainTable'));
                            let selectedRow = $('.ant-table-row.ant-table-row-level-0.ant-table-row-selected');
                            selectedRow.find('.ant-checkbox-wrapper').removeClass('ant-checkbox-wrapper-checked');
                            selectedRow.find('.ant-checkbox').removeClass('ant-checkbox-checked');
                            selectedRow.find('.ant-checkbox-input').removeAttr('checked');
                            selectedRow.find('.ant-checkbox-wrapper').click();
                            selectedRow.removeClass('ant-table-row-selected');
                        });
                        setIsModalVisible(false);
                    }
                });
            }
        } else if (data.act === 'modify') {
            if(!$('#studentName').val()) {
                alert('Name is required!');
            } else {
                $.post({
                    url: 'php/modifyStudent.php',
                    data: {
                        num: data.num,
                        name: $('#studentName').val(),
                        subject: subject,
                        remaining: $('#studentRemainingLessons').val(),
                        used: $('#studentUsedLessons').val(),
                        total: $('#studentTotalLessons').val(),
                    },
                    cache: false,
                    success: function () {
                        $.getJSON('data/chen/student.json', function (data) {
                            ReactDOM.render(React.createElement(MainTable, data),
                                document.getElementById('mainTable'));
                        });
                        setIsModalVisible(false);
                    }
                });
            }
        }
    };
    const handleCancel = () => {
        setIsModalVisible(false);
    };

    function handleChange(e) {
        subject = e.target['value'];
    }

    function lessonChange(e) {
        if (e.target.value.length > 1 && e.target.value[0] == 0) {
            e.target.value = e.target.value[1];
        } else {
            if (e.target['id'] === 'studentRemainingLessons') {
                if (parseInt(e.target.value) > parseInt($('#studentTotalLessons').val())) {
                    e.target.value = $('#studentTotalLessons').val();
                    $('#studentUsedLessons').val(0);
                } else {
                    let studentUsedLessons = $('#studentTotalLessons').val() - e.target['value'];
                    $('#studentUsedLessons').val(studentUsedLessons);
                }
            } else if (e.target['id'] === 'studentUsedLessons') {
                if (parseInt(e.target.value) > parseInt($('#studentTotalLessons').val())) {
                    e.target.value = $('#studentTotalLessons').val();
                    $('#studentRemainingLessons').val(0);
                } else {
                    let studentRemainingLessons = $('#studentTotalLessons').val() - e.target['value'];
                    $('#studentRemainingLessons').val(studentRemainingLessons);
                }
            }
        }
    }

    function lessonBlur(e) {
        if (e.target['id'] === 'studentTotalLessons') {
            if (parseInt(e.target.value) < parseInt($('#studentUsedLessons').val())) {
                e.target.value = $('#studentUsedLessons').val();
                $('#studentRemainingLessons').val(0);
            } else {
                let studentRemainingLessons = e.target['value'] - $('#studentUsedLessons').val();
                $('#studentRemainingLessons').val(studentRemainingLessons);
            }
        }
    }

    if (data.act === 'add') {
        return (React.createElement(React.Fragment, null,
            React.createElement(Button, { type: "primary", onClick: showModal }, "Add.."),
            React.createElement(Modal, {
                    title: "Add Student", visible: isModalVisible, onOk: handleOk, width: 312,
                    onCancel: handleCancel, destroyOnClose: true
                },
                React.createElement(Space, {direction: "vertical"},
                    React.createElement(Input, { placeholder: "Name", id: "newStudentName", required: "required"}),
                    React.createElement(Radio.Group, {name: "newStudentSubject", onChange: handleChange },
                        React.createElement(Space, {direction: "vertical"},
                            React.createElement(Radio, {value: "English 1"}, "English 1"),
                            React.createElement(Radio, {value: "English 2"}, "English 2"),
                            React.createElement(Radio, {value: "English 3"}, "English 3"),
                            React.createElement(Radio, {value: "English 4"}, "English 4"),
                            React.createElement(Radio, {value: "English 5"}, "English 5"),
                            React.createElement(Radio, {value: "English 6"}, "English 6"),
                            React.createElement(Radio, {value: "English 7"}, "English 7"),
                            React.createElement(Radio, {value: "English 8"}, "English 8"),
                            React.createElement(Radio, {value: "Olympic Math 1"}, "Olympic Math 1"),
                            React.createElement(Radio, {value: "Olympic Math 2"}, "Olympic Math 2"))),
                    React.createElement(Input, {
                        type: "number", placeholder: "Total Lessons",
                        id: "newStudentTotalLessons"
                    })
                ))));
    } else if (data.act === 'modify') {
        return (React.createElement(React.Fragment, null,
            React.createElement(Button, { onClick: showModal }, "Modify"),
            React.createElement(Modal, {
                    title: "Modify", visible: isModalVisible, onOk: handleOk, width: 416,
                    onCancel: handleCancel, destroyOnClose: true
                },
                React.createElement(Space, { direction: "vertical" },
                    React.createElement(Input, { placeholder: "Name", id: "studentName",
                        defaultValue: data.name }),
                    React.createElement(Radio.Group, { name: "studentSubject", onChange: handleChange,
                            defaultValue: data.subject[0] },
                        React.createElement(Space, {direction: "vertical"},
                            React.createElement(Radio, {value: "English 1"}, "English 1"),
                            React.createElement(Radio, {value: "English 2"}, "English 2"),
                            React.createElement(Radio, {value: "English 3"}, "English 3"),
                            React.createElement(Radio, {value: "English 4"}, "English 4"),
                            React.createElement(Radio, {value: "English 5"}, "English 5"),
                            React.createElement(Radio, {value: "English 6"}, "English 6"),
                            React.createElement(Radio, {value: "English 7"}, "English 7"),
                            React.createElement(Radio, {value: "English 8"}, "English 8"),
                            React.createElement(Radio, {value: "Olympic Math 1"}, "Olympic Math 1"),
                            React.createElement(Radio, {value: "Olympic Math 2"}, "Olympic Math 2"))),
                    React.createElement(Space, null, React.createElement("h4", null, "Remaining Lessons:"),
                        React.createElement('input', {
                            type: "number", class: "ant-input", placeholder: "Remaining Lessons",
                            id: "studentRemainingLessons", defaultValue: data.remaining,
                            onInput: lessonChange, onBlur: lessonBlur
                        })),
                    React.createElement(Space, null, React.createElement("h4", null, "Used Lessons:&"),
                        React.createElement('input', {
                            type: "number", class: "ant-input", placeholder: "Used Lessons",
                            id: "studentUsedLessons", defaultValue: data.used,
                            onInput: lessonChange, onBlur: lessonBlur
                        })),
                    React.createElement(Space, null, React.createElement("h4", null, "Total Lessons:"),
                        React.createElement('input', {
                            type: "number", class: "ant-input", placeholder: "Total Lessons",
                            id: "studentTotalLessons", defaultValue: data.total,
                            onInput: lessonChange, onBlur: lessonBlur
                        }))
                ))));
    }
};

$(document).ready(function() {
    if (!sessionStorage.getItem('user')) {
        $(location).attr('href', 'index.html');
        alert('Without Login!');
    } else {
        ReactDOM.render(React.createElement(Space, { size: "middle" },
            React.createElement(CurrentTime, null), React.createElement(User, null)),
            document.getElementById('userState')
        );

        let studentNumber = 0;
        $.ajax({
            url: 'data/chen/student.json',
            dataType: 'json',
            cache: false,
            async: false,
            success: function(data) {
                studentNumber = data.length;
                ReactDOM.render(React.createElement(MainTable, data),
                    document.getElementById('mainTable'));
            }
        });

        let dataSource = [];
        function handleChange(value) {
            $.ajax({
                url: 'data/chen/student.json',
                dataType: 'json',
                cache: false,
                success: function(data) {
                    if (value === 'All') {
                        dataSource = data;
                    } else {
                        let filteredData = [];
                        for (let i = 0; i < data.length; i++) {
                            if ($.inArray(value, data[i]['subject']) > -1) {
                                filteredData.push(data[i]);
                            }
                        }
                        dataSource = filteredData;
                    }
                    ReactDOM.render(React.createElement(Table, {
                            rowSelection: Object.assign({type: "checkbox"},
                                rowSelection), columns: columns, dataSource: dataSource
                        }),
                        document.getElementById('mainTable'));
                    ReactDOM.render(React.createElement("h3", null, dataSource.length),
                        document.getElementById('studentNumber'));
                }
            });
        }

        ReactDOM.render(React.createElement(Space, { size: "middle" },
            React.createElement("h3", null, "Subject:"),
            React.createElement(Select, { defaultValue: "All", style: { width: 160 }, onChange: handleChange },
                React.createElement(Option, { value: "All" }, "All"),
                React.createElement(Option, { value: "English 1" }, "English 1"),
                React.createElement(Option, { value: "English 2" }, "English 2"),
                React.createElement(Option, { value: "English 3" }, "English 3"),
                React.createElement(Option, { value: "English 4" }, "English 4"),
                React.createElement(Option, { value: "English 5" }, "English 5"),
                React.createElement(Option, { value: "English 6" }, "English 6"),
                React.createElement(Option, { value: "English 7" }, "English 7"),
                React.createElement(Option, { value: "English 8" }, "English 8"),
                React.createElement(Option, { value: "Olympic Math 1" }, "Olympic Math 1"),
                React.createElement(Option, { value: "Olympic Math 2" }, "Olympic Math 2")),
            React.createElement("h3", null, "Total:"),
            React.createElement("div", { id : 'studentNumber' }, React.createElement("h3", null, studentNumber))),
            document.getElementById('subjectList'));

        ReactDOM.render(React.createElement(Space, { size: "middle" },
            React.createElement(ModalButton, { act: "add" }),
            React.createElement(Button, { id: "delStudent" }, "Delete")),
            document.getElementById('actionButton'));
    }

    $('#delStudent').on('click', function() {
        $.post({
            url: 'php/delStudent.php',
            data: {
                key: delKeys
            },
            success: function() {
                $.ajax({
                    url: 'data/chen/student.json',
                    dataType: 'json',
                    cache: false,
                    success: function(data) {
                        ReactDOM.render(React.createElement(MainTable, data),
                            document.getElementById('mainTable'));
                    }
                });
            }
        });
    });
});
